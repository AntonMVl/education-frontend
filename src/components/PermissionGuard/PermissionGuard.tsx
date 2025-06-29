import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { Permission } from '../../types/permissions'

interface PermissionGuardProps {
	children: React.ReactNode
	requiredPermissions: Permission[]
	requireAll?: boolean // true - все права, false - любое из прав
	fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
	children,
	requiredPermissions,
	requireAll = false,
	fallback = <div>У вас нет прав для доступа к этому разделу</div>,
}) => {
	const { hasAnyPermission, hasAllPermissions, loading } = usePermissions()

	if (loading) {
		return <div>Загрузка прав доступа...</div>
	}

	const hasAccess = requireAll
		? hasAllPermissions(requiredPermissions)
		: hasAnyPermission(requiredPermissions)

	if (!hasAccess) {
		return <>{fallback}</>
	}

	return <>{children}</>
}

export default PermissionGuard
