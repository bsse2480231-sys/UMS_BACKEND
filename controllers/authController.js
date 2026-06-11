const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/email');
require('dotenv').config();

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Get the profile ID based on role
    let profileId = '';
    if (user.role === 'Student') {
      const res = await pool.query('SELECT student_id FROM Student WHERE user_id = $1', [user.user_id]);
      profileId = res.rows[0]?.student_id;
    } else if (user.role === 'Instructor') {
      const res = await pool.query('SELECT instructor_id FROM Instructor WHERE user_id = $1', [user.user_id]);
      profileId = res.rows[0]?.instructor_id;
    } else if (user.role === 'Admin') {
      const res = await pool.query('SELECT admin_id FROM Admin WHERE user_id = $1', [user.user_id]);
      profileId = res.rows[0]?.admin_id;
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, profileId: profileId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, id: profileId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is: ${otp}`,
    });
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Email could not be sent' });
  }
};

// @desc    Get logged-in user's profile based on token
exports.getMe = async (req, res) => {
  try {
    const { user_id, role } = req.user;

    let result;
    if (role === 'Student') {
      result = await pool.query(
        'SELECT s.student_id, s.first_name, s.last_name, s.phone, s.current_semester, s.status, u.email FROM Student s JOIN "User" u ON s.user_id = u.user_id WHERE s.user_id = $1',
        [user_id]
      );
    } else if (role === 'Instructor') {
      result = await pool.query(
        'SELECT i.instructor_id, i.first_name, i.last_name, i.specialization, i.designation, u.email FROM Instructor i JOIN "User" u ON i.user_id = u.user_id WHERE i.user_id = $1',
        [user_id]
      );
    } else if (role === 'Admin') {
      result = await pool.query(
        'SELECT a.admin_id, a.first_name, a.last_name, a.role, u.email FROM Admin a JOIN "User" u ON a.user_id = u.user_id WHERE a.user_id = $1',
        [user_id]
      );
    }

    if (!result || result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Attach the role to the response so frontend knows what it is
    const profileData = { ...result.rows[0], role: role };
    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged-in user's courses
exports.getMyCourses = async (req, res) => {
  try {
    const { profileId, role } = req.user;
    let result;

    if (role === 'Student') {
      result = await pool.query(`
        SELECT e.enrollment_id, c.course_code, c.course_name, e.semester, e.grade, e.status 
        FROM Enrollment e JOIN Course c ON e.course_id = c.course_id 
        WHERE e.student_id = $1`, [profileId]);
    } else if (role === 'Instructor') {
      result = await pool.query(`
        SELECT t.teaching_id, c.course_id,c.course_code, c.course_name, t.semester, t.section, cl.room_number 
        FROM Teaching t 
        JOIN Course c ON t.course_id = c.course_id 
        JOIN Classroom cl ON t.classroom_id = cl.classroom_id
        WHERE t.instructor_id = $1`, [profileId]);
        
    } else {
      return res.status(400).json({ message: 'Admins do not have courses' });
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged-in student's fees
exports.getMyFees = async (req, res) => {
  try {
    const { profileId, role } = req.user;
    if (role !== 'Student') return res.status(403).json({ message: 'Only students have fees' });

    const result = await pool.query('SELECT * FROM Fee WHERE student_id = $1', [profileId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged-in student's attendance
exports.getMyAttendance = async (req, res) => {
  try {
    const { profileId, role } = req.user;
    if (role !== 'Student') return res.status(403).json({ message: 'Only students have attendance' });

    const result = await pool.query(`
      SELECT a.attendance_id, c.course_code, c.course_name, a.date, a.status 
      FROM Attendance a JOIN Course c ON a.course_id = c.course_id 
      WHERE a.student_id = $1 ORDER BY a.date DESC
    `, [profileId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged-in student's borrowed books
exports.getMyLibrary = async (req, res) => {
  try {
    const { profileId, role } = req.user;
    if (role !== 'Student') return res.status(403).json({ message: 'Only students borrow books' });

    const result = await pool.query(`
      SELECT bi.issue_id, b.title, b.author, bi.issue_date, bi.due_date, bi.return_date, bi.status 
      FROM book_issue bi JOIN Book b ON bi.book_id = b.book_id 
      WHERE bi.student_id = $1 ORDER BY bi.issue_date DESC
    `, [profileId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};