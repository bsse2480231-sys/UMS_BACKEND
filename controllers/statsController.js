const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  const { role, profileId } = req.user;

  try {
    let stats = {};

    if (role === 'Admin') {
      const stuCount = await pool.query('SELECT COUNT(*) FROM Student');
      const instCount = await pool.query('SELECT COUNT(*) FROM Instructor');
      const courseCount = await pool.query('SELECT COUNT(*) FROM Course');
      const enrollCount = await pool.query('SELECT COUNT(*) FROM Enrollment');
      
      const feePaid = await pool.query("SELECT COUNT(*) FROM Fee WHERE status = 'Paid'");
      const feeUnpaid = await pool.query("SELECT COUNT(*) FROM Fee WHERE status = 'Unpaid'");
      const feeOverdue = await pool.query("SELECT COUNT(*) FROM Fee WHERE status = 'Overdue'");

      stats = {
        totalStudents: parseInt(stuCount.rows[0].count),
        totalInstructors: parseInt(instCount.rows[0].count),
        totalCourses: parseInt(courseCount.rows[0].count),
        totalEnrollments: parseInt(enrollCount.rows[0].count),
        feeStatus: [
          { name: 'Paid', value: parseInt(feePaid.rows[0].count) },
          { name: 'Unpaid', value: parseInt(feeUnpaid.rows[0].count) },
          { name: 'Overdue', value: parseInt(feeOverdue.rows[0].count) }
        ]
      };
    } 
    else if (role === 'Student') {
      const courses = await pool.query('SELECT COUNT(*) FROM Enrollment WHERE student_id = $1', [profileId]);
      const attendance = await pool.query(
        'SELECT COUNT(*) FILTER(WHERE status = $1) as present, COUNT(*) as total FROM Attendance WHERE student_id = $2', 
        ['Present', profileId]
      );
      const fees = await pool.query("SELECT COALESCE(SUM(amount), 0) as pending FROM Fee WHERE student_id = $1 AND status != 'Paid'", [profileId]);

      const attData = attendance.rows[0];
      const attRate = attData.total > 0 ? Math.round((attData.present / attData.total) * 100) : 0;

      stats = {
        enrolledCourses: parseInt(courses.rows[0].count),
        attendanceRate: attRate,
        pendingFees: parseFloat(fees.rows[0].pending)
      };
    } 
    else if (role === 'Instructor') {
      const courses = await pool.query('SELECT COUNT(*) FROM Teaching WHERE instructor_id = $1', [profileId]);
      const students = await pool.query(
        `SELECT COUNT(DISTINCT e.student_id) 
         FROM Enrollment e JOIN Teaching t ON e.course_id = t.course_id 
         WHERE t.instructor_id = $1`, 
        [profileId]
      );

      stats = {
        myCourses: parseInt(courses.rows[0].count),
        totalStudents: parseInt(students.rows[0].count)
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};