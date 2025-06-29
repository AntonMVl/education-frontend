export enum Permission {
	// Управление пользователями
	CREATE_USERS = 'create_users',
	DELETE_USERS = 'delete_users',
	EDIT_USERS = 'edit_users',

	// Управление курсами
	MANAGE_COURSES = 'manage_courses',

	// Управление лекциями
	MANAGE_LECTURES = 'manage_lectures',

	// Управление тестами
	MANAGE_TESTS = 'manage_tests',

	// Проверка экзаменов
	REVIEW_EXAMS = 'review_exams',

	// Управление администраторами
	MANAGE_ADMINS = 'manage_admins',

	// Управление правами администраторов
	MANAGE_ADMIN_PERMISSIONS = 'manage_admin_permissions',
}

export const PermissionDisplayNames: Record<Permission, string> = {
	[Permission.CREATE_USERS]: 'Добавление пользователя',
	[Permission.DELETE_USERS]: 'Удаление пользователя',
	[Permission.EDIT_USERS]: 'Редактирование пользователя',
	[Permission.MANAGE_COURSES]: 'Добавление, редактирование и удаление курсов',
	[Permission.MANAGE_LECTURES]: 'Добавление, редактирование и удаление лекций',
	[Permission.MANAGE_TESTS]: 'Добавление, редактирование и удаление тестов',
	[Permission.REVIEW_EXAMS]: 'Проверка экзаменов',
	[Permission.MANAGE_ADMINS]:
		'Создание, редактирование и удаление администраторов',
	[Permission.MANAGE_ADMIN_PERMISSIONS]: 'Управление правами администраторов',
}

export interface AdminPermission {
	permission: Permission
	displayName: string
	grantedAt: string
	grantedBy: {
		id: number
		firstName: string
		lastName: string
	} | null
}

export interface AdminWithPermissions {
	id: number
	firstName: string
	lastName: string
	login: string
	role: string
	city: string
	createdAt: string
	permissions: AdminPermission[]
}

export interface AdminPermissionsResponse {
	admin: {
		id: number
		firstName: string
		lastName: string
		login: string
		role: string
	}
	permissions: AdminPermission[]
}
