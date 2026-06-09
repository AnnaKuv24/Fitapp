# FitApp — Фітнес-веб-застосунок

Повноцінний веб-застосунок для відстеження тренувань.
**Frontend:** HTML5 / CSS3 / Vanilla JS | **Backend:** Java 17 + Spring Boot 3

---

## 📁 Структура проєкту

```
fitapp/
├── frontend/
│   ├── pages/         # HTML-сторінки
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── workout.html
│   │   └── progress.html
│   ├── css/           # Стилі
│   │   ├── main.css        (Design System — змінні, компоненти)
│   │   ├── auth.css        (Сторінка входу)
│   │   ├── dashboard.css   (Головна панель)
│   │   ├── workout.css     (Тренування)
│   │   └── responsive.css  (Адаптивність)
│   └── js/            # JavaScript
│       ├── api.js          (REST-клієнт + Mock-дані)
│       ├── auth.js         (Guard + Sidebar)
│       ├── login.js        (Форма входу/реєстрації)
│       ├── dashboard.js    (Головна + Chart.js)
│       ├── workout.js      (Покроковий режим тренування)
│       └── progress.js     (Аналітика + графіки)
└── backend/
    ├── pom.xml
    └── src/main/java/com/fitapp/
        ├── FitAppApplication.java
        ├── model/         (JPA entities)
        ├── repository/    (Spring Data JPA)
        ├── dto/           (Request/Response DTO)
        ├── controller/    (REST endpoints)
        ├── service/       (бізнес-логіка)
        ├── security/      (JWT + Filter)
        └── config/        (Security + CORS)
```

---

<<<<<<< HEAD
=======

>>>>>>> c86658b9081ebdf8bf491e73a6e7fdb8a06a9ab4

## 🔑 REST API Endpoints

| Метод | URL | Опис |
|-------|-----|------|
| POST | /api/v1/auth/register | Реєстрація |
| POST | /api/v1/auth/login | Вхід |
| POST | /api/v1/auth/refresh | Refresh токена |
| GET  | /api/v1/workout-plans | Список програм |
| GET  | /api/v1/workout-plans/{id} | Деталі програми |
| POST | /api/v1/workout/start | Розпочати тренування |
| POST | /api/v1/workout/set | Зафіксувати підхід |
| POST | /api/v1/workout/finish | Завершити тренування |
| GET  | /api/v1/progress?period=month | Статистика |
| GET  | /api/v1/progress/records | Особисті рекорди |
| GET  | /api/v1/exercises | Бібліотека вправ |

---

## 🛡️ Безпека

- JWT (access 15хв + refresh 7 днів)
- BCrypt для хешування паролів
- RBAC ролі: USER / TRAINER / ADMIN
- CORS конфігурація
- Spring Security filter chain

---

## 📱 Responsive Design

| Breakpoint | Пристрій | Колонки вправ |
|-----------|---------|---------------|
| < 480px   | Mobile  | 1 колонка |
| 481–1023px | Tablet | 2 колонки |
| ≥ 1024px  | Desktop | 3–4 колонки |

---

## 🎨 Дизайн

- CSS Custom Properties (Design Tokens)
- Gradient акценти (#6366f1 → #8b5cf6)
- Smooth animations та hover-ефекти
- Chart.js для графіків прогресу
- Skeleton loaders при завантаженні
- Toast notifications
