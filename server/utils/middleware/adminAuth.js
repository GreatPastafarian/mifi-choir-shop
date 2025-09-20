const checkAdmin = (req, res, next) => {
  console.log('Проверка прав администратора...');
  console.log('req.user:', req.user);

  // Проверяем, является ли пользователь администратором
  if (req.user && req.user.role === 'admin') {
    console.log('Пользователь является администратором');
    next();
  } else {
    console.log('Доступ запрещен. Пользователь не администратор. Роль:', req.user?.role);
    res.status(403).json({
      message: 'Доступ запрещен. Требуются права администратора',
      userRole: req.user?.role,
    });
  }
};

module.exports = { checkAdmin };
