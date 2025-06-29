export const roleNames = ['user', 'admin', 'superadmin'] as const
export type Role = (typeof roleNames)[number]

export const roleDisplayNames: Record<Role, string> = {
	user: 'User',
	admin: 'Admin',
	superadmin: 'Superadmin',
}

export function getRoleDisplayName(role: string): string {
	const normalized = role?.toLowerCase()
	return roleDisplayNames[normalized as Role] || role
}

export function normalizeRoleValue(role: string): Role {
	const normalized = role?.toLowerCase()
	if (roleNames.includes(normalized as Role)) return normalized as Role
	return 'user'
}

export const cityNames: string[] = [
	'Сыктывкар',
	'Эжва',
	'Воркута',
	'Ухта',
	'Печора',
	'Усинск',
	'Сосногорск',
	'Инта',
	'Вуктыл',
	'Ижемский',
	'Княжпогостский',
	'Койгородский',
	'Корткеросский',
	'Прилузский',
	'Сыктывдинский',
	'Сысольский',
	'Троицко-Печорский',
	'Удорский',
	'Усть-Вымский',
	'Усть-Куломский',
	'Усть-Цилемский',
]
