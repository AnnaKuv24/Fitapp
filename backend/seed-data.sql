-- ============================================================================
-- FitApp — наповнення довідкових таблиць (вправи + програми тренувань)
-- Запускати в базі fitness_db (наприклад, через MySQL-клієнт у VS Code)
-- ============================================================================
USE fitness_db;

-- ── Тестові акаунти (адмін / тренер) ────────────────────────────────────────
-- Паролі вже захешовані через BCrypt (відповідають значенням нижче в коментарі).
-- admin@fitapp.com   / Admin12345
-- trainer@fitapp.com / Trainer12345
INSERT INTO users (name, email, password_hash, role, subscription, created_at)
VALUES
  ('Адмін Фіт',   'admin@fitapp.com',   '$2a$10$ZKlFYZU3mxCgiGLAb0aXxu9oO5Bydhl9WQSDJKBMuh/JJF3/6pdpa', 'ADMIN',   'PREMIUM', NOW()),
  ('Тренер Фіт',  'trainer@fitapp.com', '$2a$10$ohAzhEViI9UrWxZVlYqgwOIjjGJjvil7ivSVIpMCtrfSjQ58zre4a', 'TRAINER', 'PREMIUM', NOW())
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role          = VALUES(role),
  subscription  = VALUES(subscription);

-- ── Вправи ──────────────────────────────────────────────────────────────────
INSERT INTO exercises (name, description, muscle_group, image_url, created_by) VALUES
('Жим лежачи', 'Класична базова вправа для грудних м''язів. Лягти на лаву, хват трохи ширший за плечі, опустити штангу до грудей і виштовхнути вгору.', 'Груди', 'https://commons.wikimedia.org/wiki/Special:FilePath/Bench_press_1.jpg', NULL),
('Жим гантелей на похилій лаві', 'Акцентує верхню частину грудних м''язів. Виконується на лаві з нахилом 30-45 градусів.', 'Груди', 'https://commons.wikimedia.org/wiki/Special:FilePath/Dumbbell-incline-bench-press-1.png', NULL),
('Розведення гантелей лежачи', 'Ізолююча вправа для грудних м''язів — розведення рук з гантелями в сторони лежачи на горизонтальній лаві.', 'Груди', 'https://commons.wikimedia.org/wiki/Special:FilePath/Dumbbell-flys-1.png', NULL),

('Тяга верхнього блоку', 'Вправа для розвитку широчайших м''язів спини. Тягнути рукоять до грудей, лопатки звести разом.', 'Спина', 'https://commons.wikimedia.org/wiki/Special:FilePath/Back_Pull_down.jpg', NULL),
('Становa тяга', 'Базова багатосуглобова вправа для м''язів спини, сідниць і задньої поверхні стегна.', 'Спина', 'https://commons.wikimedia.org/wiki/Special:FilePath/Fit_young_man_doing_deadlift_exercise_in_gym.jpg', NULL),
('Тяга штанги в нахилі', 'Вправа для товщини спини. Корпус нахилений вперед, тягнути штангу до низу живота.', 'Спина', 'https://commons.wikimedia.org/wiki/Special:FilePath/Barbell-rear-delt-row-1.png', NULL),

('Присідання зі штангою', 'Базова вправа для квадрицепсів, сідниць і м''язів попереку. Штанга на верхній частині спини, присід до паралелі стегна з підлогою.', 'Ноги', 'https://commons.wikimedia.org/wiki/Special:FilePath/Woman_doing_squat_workout_in_gym_with_barbell%2C_back_view.jpg', NULL),
('Випади з гантелями', 'Вправа для квадрицепсів і сідниць — почергові кроки вперед з гантелями в руках.', 'Ноги', 'https://commons.wikimedia.org/wiki/Special:FilePath/Low_Lunge.jpg', NULL),
('Жим ногами в тренажері', 'Базова вправа для м''язів ніг у тренажері під кутом — менше навантаження на хребет, ніж присідання.', 'Ноги', 'https://commons.wikimedia.org/wiki/Special:FilePath/Gym_Leg_Press_Machine.jpg', NULL),

('Жим штанги стоячи', 'Базова вправа для дельтоподібних м''язів плечей — виштовхування штанги над головою стоячи.', 'Плечі', 'https://commons.wikimedia.org/wiki/Special:FilePath/Military_press_ez-bar_25022008.jpg', NULL),
('Розведення гантелей в сторони', 'Ізолююча вправа для середніх пучків дельт — підйом гантелей через сторони до рівня плечей.', 'Плечі', 'https://commons.wikimedia.org/wiki/Special:FilePath/DumbbellLateralRaise.JPG', NULL),
('Тяга штанги до підборіддя', 'Вправа для верхньої частини трапецієподібних і дельтоподібних м''язів.', 'Плечі', 'https://commons.wikimedia.org/wiki/Special:FilePath/Upright-row-1.png', NULL),

('Підйом штанги на біцепс', 'Класична ізолююча вправа для двоголового м''яза плеча. Згинання рук зі штангою стоячи.', 'Руки', 'https://commons.wikimedia.org/wiki/Special:FilePath/Biceps-curl-1.png', NULL),
('Французький жим', 'Вправа для триголового м''яза плеча — розгинання рук зі штангою або гантеллю з-за голови.', 'Руки', 'https://commons.wikimedia.org/wiki/Special:FilePath/Decline-triceps-extension-1.png', NULL),
('Молотки з гантелями', 'Вправа для біцепса і плечової м''язи — згинання рук з гантелями нейтральним хватом.', 'Руки', 'https://commons.wikimedia.org/wiki/Special:FilePath/Bicep-hammer-curl-1.png', NULL),

('Скручування', 'Базова вправа для прямого м''яза живота — підйом корпусу лежачи на спині з зігнутими колінами.', 'Прес', 'https://commons.wikimedia.org/wiki/Special:FilePath/Crunches-1.png', NULL),
('Підйом ніг у висі', 'Вправа для нижньої частини преса — підйом прямих ніг у висі на турніку.', 'Прес', 'https://commons.wikimedia.org/wiki/Special:FilePath/Leg-raises-1.png', NULL),
('Планка', 'Статична вправа для зміцнення м''язів кору — утримання прямого положення тіла в упорі на передпліччях.', 'Прес', 'https://commons.wikimedia.org/wiki/Special:FilePath/Plank.jpg', NULL);

-- ── Програми тренувань ──────────────────────────────────────────────────────
INSERT INTO workout_plans (name, description, level, goal, emoji, color, created_by) VALUES
('Сила та маса', 'Програма для набору м''язової маси з акцентом на базові багатосуглобові вправи.', 'INTERMEDIATE', 'MUSCLE_GAIN', '💪', 'blue', NULL),
('Full Body', 'Тренування всього тіла — оптимально для початківців, 3 рази на тиждень.', 'BEGINNER', 'MAINTENANCE', '🏃', 'green', NULL),
('PPL Split', 'Push Pull Legs — спліт-програма для просунутих, 6 тренувань на тиждень.', 'ADVANCED', 'MUSCLE_GAIN', '🔥', 'purple', NULL);

-- ── Зв'язок програм з вправами (plan_exercises) ─────────────────────────────

-- Сила та маса
INSERT INTO plan_exercises (plan_id, exercise_id, sets_count, reps, rest_seconds, order_num)
SELECT wp.id, e.id, v.sets_count, v.reps, v.rest_seconds, v.order_num FROM workout_plans wp
CROSS JOIN (VALUES
  ROW('Жим лежачи',            4, 8,  120, 1),
  ROW('Присідання зі штангою', 4, 6,  150, 2),
  ROW('Тяга верхнього блоку',  3, 10, 90,  3),
  ROW('Жим штанги стоячи',     3, 10, 90,  4),
  ROW('Підйом штанги на біцепс', 3, 12, 60, 5),
  ROW('Скручування',           3, 15, 45,  6)
) AS v(ex_name, sets_count, reps, rest_seconds, order_num)
JOIN exercises e ON e.name = v.ex_name
WHERE wp.name = 'Сила та маса';

-- Full Body
INSERT INTO plan_exercises (plan_id, exercise_id, sets_count, reps, rest_seconds, order_num)
SELECT wp.id, e.id, v.sets_count, v.reps, v.rest_seconds, v.order_num FROM workout_plans wp
CROSS JOIN (VALUES
  ROW('Присідання зі штангою',        3, 10, 90, 1),
  ROW('Жим лежачи',                   3, 10, 90, 2),
  ROW('Тяга верхнього блоку',         3, 12, 75, 3),
  ROW('Випади з гантелями',           3, 12, 75, 4),
  ROW('Розведення гантелей в сторони',3, 12, 60, 5),
  ROW('Молотки з гантелями',          3, 12, 60, 6),
  ROW('Планка',                       3, 1,  45, 7),
  ROW('Скручування',                  3, 15, 45, 8)
) AS v(ex_name, sets_count, reps, rest_seconds, order_num)
JOIN exercises e ON e.name = v.ex_name
WHERE wp.name = 'Full Body';

-- PPL Split
INSERT INTO plan_exercises (plan_id, exercise_id, sets_count, reps, rest_seconds, order_num)
SELECT wp.id, e.id, v.sets_count, v.reps, v.rest_seconds, v.order_num FROM workout_plans wp
CROSS JOIN (VALUES
  ROW('Жим лежачи',                     4, 8,  120, 1),
  ROW('Жим гантелей на похилій лаві',   3, 10, 90,  2),
  ROW('Жим штанги стоячи',              3, 10, 90,  3),
  ROW('Французький жим',                3, 12, 60,  4),
  ROW('Становa тяга',                   4, 6,  150, 5),
  ROW('Тяга штанги в нахилі',           3, 10, 90,  6),
  ROW('Тяга штанги до підборіддя',      3, 12, 75,  7),
  ROW('Підйом штанги на біцепс',        3, 12, 60,  8),
  ROW('Присідання зі штангою',          4, 6,  150, 9),
  ROW('Жим ногами в тренажері',         3, 12, 90,  10)
) AS v(ex_name, sets_count, reps, rest_seconds, order_num)
JOIN exercises e ON e.name = v.ex_name
WHERE wp.name = 'PPL Split';
