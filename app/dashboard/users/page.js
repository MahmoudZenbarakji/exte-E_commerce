// app/dashboard/users/page.js
'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const { currentLanguage, translations } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const response = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4 sm:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse font-light">{translations.loading || 'Loading users...'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4 sm:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-gray-900 uppercase">
          {translations.usersManagement || 'Users Management'}
        </h1>
        <p className="text-gray-600 mt-2 font-light text-sm sm:text-base">
          {translations.welcomeToUsersManagement || 'Welcome to users management'}, {session?.user?.firstName}!
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200">
        {/* Table Header */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
          <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">
            {translations.users || 'USERS'} ({users.length})
          </h2>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                  {translations.user || 'User'}
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                  {translations.email || 'Email'}
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                  {translations.role || 'Role'}
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                  {translations.actions || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                  {/* User Column */}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        {user.image ? (
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-gray-300"
                            src={user.image}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
                            <span className="text-gray-600 text-xs sm:text-sm font-light">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="text-sm font-light text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500 font-light sm:hidden">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email Column - Hidden on mobile */}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-light hidden sm:table-cell">
                    {user.email}
                  </td>

                  {/* Role Column */}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-light rounded-none border ${
                      user.role === 'admin' 
                        ? 'bg-purple-50 text-purple-800 border-purple-200' :
                      user.role === 'restaurant_owner' 
                        ? 'bg-green-50 text-green-800 border-green-200' :
                      user.role === 'chef'
                        ? 'bg-orange-50 text-orange-800 border-orange-200' :
                      user.role === 'waiter'
                        ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      user.role === 'delivery'
                        ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                        'bg-gray-50 text-gray-800 border-gray-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        disabled={updating === user._id}
                        className="block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm"
                      >
                        <option value="user">{translations.user || 'User'}</option>
                        <option value="admin">{translations.admin || 'Admin'}</option>
                      </select>
                      {updating === user._id && (
                        <span className="text-xs text-gray-500 font-light">{translations.updating || 'Updating...'}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-light text-sm">{translations.noUsersFound || 'No users found.'}</p>
          </div>
        )}

        {/* Mobile Card View (Alternative to table for very small screens) */}
        <div className="sm:hidden border-t border-gray-200">
          {users.map((user) => (
            <div key={user._id} className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.image ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover border border-gray-300"
                        src={user.image}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
                        <span className="text-gray-600 text-sm font-light">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-light text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500 font-light">
                      {user.email}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-light rounded-none border ${
                  user.role === 'admin' 
                    ? 'bg-purple-50 text-purple-800 border-purple-200' :
                  user.role === 'restaurant_owner' 
                    ? 'bg-green-50 text-green-800 border-green-200' :
                    'bg-gray-50 text-gray-800 border-gray-200'
                }`}>
                  {user.role}
                </span>
              </div>
              
              <div className="space-y-2">
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user._id, e.target.value)}
                  disabled={updating === user._id}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm"
                >
                  <option value="user">{translations.user || 'User'}</option>
                  <option value="admin">{translations.admin || 'Admin'}</option>
                </select>
                {updating === user._id && (
                  <span className="text-xs text-gray-500 font-light block text-center">{translations.updatingRole || 'Updating role...'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-light text-gray-900">{users.length}</div>
          <div className="text-xs text-gray-500 font-light mt-1">{translations.totalUsers || 'TOTAL USERS'}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-light text-gray-900">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-xs text-gray-500 font-light mt-1">{translations.admins || 'ADMINS'}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-light text-gray-900">
            {users.filter(u => u.role === 'user').length}
          </div>
          <div className="text-xs text-gray-500 font-light mt-1">{translations.users || 'USERS'}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 text-center hidden sm:block">

        </div>
        <div className="bg-white border border-gray-200 p-4 text-center hidden lg:block">

        </div>
        <div className="bg-white border border-gray-200 p-4 text-center hidden lg:block">

        </div>
      </div>
    </div>
  );
}