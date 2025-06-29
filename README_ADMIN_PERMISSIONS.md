# Система прав администраторов

## Обзор

Система управления правами администраторов с тремя уровнями доступа:

- **Суперадмин** - полный доступ ко всем функциям
- **Админ** - ограниченный доступ в зависимости от предоставленных прав
- **Пользователь** - базовый доступ

## Права администраторов

### Доступные права

- `create_users` - Создание пользователей
- `edit_users` - Редактирование пользователей
- `delete_users` - Удаление пользователей
- `manage_admins` - Управление администраторами
- `manage_admin_permissions` - Управление правами администраторов

### Автоматические права

При предоставлении права `manage_admins` автоматически добавляются:

- `create_users`
- `edit_users`
- `delete_users`

## Защита суперадминов

### Фронтенд

- Кнопки "Редактировать разрешения" и "Удалить" скрыты для суперадминов, когда пользователь зашел под админом
- Суперадмины отмечены специальным бейджем "Суперадмин"
- Для суперадминов показывается заметка "Суперадмин защищен от изменений"

### Бэкенд

- Админы не могут изменять права суперадминов
- Админы не могут удалять суперадминов
- Админы видят только других админов (не суперадминов) в списке администраторов

## Логика отображения кнопок

### Для суперадмина

- Видит всех администраторов и суперадминов
- Может редактировать права всех администраторов (кроме себя)
- Может удалять всех администраторов (кроме себя)

### Для админа

- Видит всех администраторов и суперадминов
- Может редактировать права только других админов (не суперадминов, не себя)
- Может удалять только других админов (не суперадминов, не себя)
- Не может управлять суперадминами (кнопки скрыты)
- Не может управлять собой (кнопки скрыты)

## API эндпоинты

### Получение списка администраторов

```
GET /admin/admins
Authorization: Bearer <token>
```

- Суперадмин видит всех администраторов и суперадминов
- Админ видит только других админов

### Редактирование прав администратора

```
PATCH /admin/admins/:id/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissions": ["create_users", "edit_users"]
}
```

- Админ не может изменять права суперадминов
- Админ не может изменять свои права

### Удаление администратора

```
DELETE /admin/users/:id
Authorization: Bearer <token>
```

- Админ не может удалять суперадминов
- Админ не может удалять себя

## Компоненты

### AdminsPage

Основная страница управления администраторами с логикой отображения кнопок в зависимости от роли пользователя.

### AdminPermissionsEdit

Модальное окно для редактирования прав администратора.

### PermissionErrorModal

Модальное окно для отображения ошибок доступа.

## Стили

### Новые элементы

- `.superadminBadge` - бейдж для суперадминов
- `.protectedNote` - заметка о защите суперадминов

## Безопасность

### Фронтенд

- Проверка прав перед отображением кнопок
- Проверка прав перед выполнением действий
- Отображение ошибок доступа

### Бэкенд

- Проверка роли пользователя
- Проверка конкретных прав
- Защита от изменения суперадминов
- Валидация входных данных

## Настройка базы данных

### Backend (NestJS)

1. Выполните SQL скрипт для создания таблицы прав:

```sql
-- Файл: education-backend/src/database/create-admin-permissions.sql
```

2. Убедитесь, что enum `permission_enum` содержит все необходимые права.

### Frontend (React)

Система прав уже интегрирована в компоненты:

- `usePermissions` - хук для проверки прав
- `PermissionErrorModal` - модальное окно ошибки прав
- Проверки прав в `UsersPage`, `AdminsPage`, `LecturesPage`

## Использование

### Проверка прав в компонентах:

```typescript
import { usePermissions } from '../hooks/usePermissions'
import { Permission } from '../types/permissions'

const MyComponent = () => {
	const { hasPermission } = usePermissions()

	const handleAction = () => {
		if (!hasPermission(Permission.CREATE_USERS)) {
			// Показать модальное окно ошибки
			return
		}
		// Выполнить действие
	}
}
```

### Модальное окно ошибки прав:

```typescript
import PermissionErrorModal from '../components/PermissionErrorModal/PermissionErrorModal'

const [permissionError, setPermissionError] = useState({
	isOpen: false,
	action: '',
})

// Показать ошибку
setPermissionError({
	isOpen: true,
	action: 'создавать пользователей',
})

// В JSX
;<PermissionErrorModal
	isOpen={permissionError.isOpen}
	onClose={() => setPermissionError({ isOpen: false, action: '' })}
	action={permissionError.action}
/>
```

## API Endpoints

### Backend API:

- `GET /admin/permissions/:adminId` - Получить права администратора
- `PUT /admin/permissions/:adminId` - Обновить права администратора
- `GET /admin/permissions/check/:permission` - Проверить право текущего пользователя

### Frontend API:

- `adminApi.getAdminPermissions(adminId)` - Получить права
- `adminApi.updateAdminPermissions(adminId, permissions)` - Обновить права
- `adminApi.checkPermission(permission)` - Проверить право

## Безопасность

1. **Только суперадминистраторы** могут управлять правами
2. Проверки прав выполняются на **frontend и backend**
3. Права кэшируются и автоматически обновляются
4. Все действия логируются для аудита

## Структура файлов

```
education-frontend/
├── src/
│   ├── components/
│   │   ├── PermissionErrorModal/
│   │   ├── AdminPermissionsInfo/
│   │   └── AdminPermissionsEdit/
│   ├── hooks/
│   │   └── usePermissions.ts
│   ├── pages/AdminPanel/
│   │   ├── UsersPage.tsx
│   │   ├── AdminsPage.tsx
│   │   └── LecturesPage.tsx
│   ├── types/
│   │   └── permissions.ts
│   └── api/
│       └── adminApi.ts

education-backend/
├── src/
│   ├── admin/
│   │   ├── entities/
│   │   │   └── admin-permission.entity.ts
│   │   ├── admin.service.ts
│   │   └── admin.controller.ts
│   ├── enums/
│   │   └── permissions.enum.ts
│   └── database/
│       └── create-admin-permissions.sql
```

## Примечания

- Система готова к использованию
- Все необходимые компоненты и хуки созданы
- Проверки прав интегрированы во все основные страницы
- Модальные окна ошибок показываются при отсутствии прав
- База данных создается автоматически при первом запуске
