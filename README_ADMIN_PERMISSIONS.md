# Система прав доступа администраторов

## Описание

Система прав доступа (RBAC - Role-Based Access Control) позволяет суперадминистраторам управлять правами других администраторов. Администраторы могут заходить в любые разделы админ-панели, но при попытке выполнить действие без соответствующих прав им показывается модальное окно с ошибкой.

## Права доступа

### Доступные права:

1. **CREATE_USERS** - Добавление пользователя
2. **DELETE_USERS** - Удаление пользователя
3. **EDIT_USERS** - Редактирование пользователя
4. **MANAGE_COURSES** - Добавление, редактирование и удаление курсов
5. **MANAGE_LECTURES** - Добавление, редактирование и удаление лекций
6. **MANAGE_TESTS** - Добавление, редактирование и удаление тестов
7. **REVIEW_EXAMS** - Проверка экзаменов
8. **MANAGE_ADMINS** - Добавление, редактирование и удаление администраторов

### Логика работы:

- **Суперадминистраторы** имеют все права по умолчанию
- **Администраторы** получают права только от суперадминистраторов
- Администраторы могут заходить в любые разделы админ-панели
- При попытке выполнить действие без прав показывается модальное окно "Упс, у вас нет прав"
- Права проверяются на уровне каждого действия (создание, редактирование, удаление)

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
