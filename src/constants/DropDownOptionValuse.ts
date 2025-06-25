export const roleNames: string[] = ['user', 'admin', 'superadmin']

export const roleDisplayNames: { [key: string]: string } = {
	user: 'User',
	admin: 'Admin',
	superadmin: 'SuperAdmin',
}

export const formatRoleForDisplay = (role: string): string => {
	return roleDisplayNames[role.toLowerCase()] || role
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
