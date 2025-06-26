import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import adminApi from '../api/adminApi'
import { RootState } from '../store/store'
import { Permission } from '../types/permissions'

export const usePermissions = () => {
	const [permissions, setPermissions] = useState<Permission[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const user = useSelector((state: RootState) => state.user.user)

	useEffect(() => {
		if (user) {
			loadPermissions()
		} else {
			setPermissions([])
			setLoading(false)
		}
	}, [user])

	const loadPermissions = async () => {
		try {
			setLoading(true)
			setError(null)
			const userPermissions = await adminApi.getMyPermissions()
			setPermissions(userPermissions)
		} catch (err) {
			setError('Ошибка при загрузке прав доступа')
			console.error('Error loading permissions:', err)
		} finally {
			setLoading(false)
		}
	}

	const hasPermission = (permission: Permission): boolean => {
		if (!user) return false

		// Суперадминистратор имеет все права
		if (user.role?.toLowerCase() === 'superadmin') {
			return true
		}

		return permissions.includes(permission)
	}

	const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
		return requiredPermissions.some(permission => hasPermission(permission))
	}

	const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
		return requiredPermissions.every(permission => hasPermission(permission))
	}

	return {
		permissions,
		loading,
		error,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		reloadPermissions: loadPermissions,
	}
}
