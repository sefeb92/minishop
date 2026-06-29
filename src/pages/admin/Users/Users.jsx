import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Trash2 } from 'lucide-react';
import './Users.css';

const Users = () => {
  const { getRegisteredUsers, updateUserRole, deleteUsers, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    const data = await getRegisteredUsers();
    setUsers(data || []);
    setSelectedUserIds([]); // Reset selection on refresh
    setLoading(false);
  }, [getRegisteredUsers]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleRoleChange = async (userId, newRole) => {
    if (currentUser?.role !== 'admin') {
      alert("Bạn không có quyền sửa vai trò của tài khoản này!");
      return;
    }
    
    if (userId === currentUser.id) {
      const confirm = window.confirm("Bạn có chắc chắn muốn thay đổi vai trò của chính mình không? Bạn có thể mất quyền truy cập Admin.");
      if (!confirm) return;
    }

    await updateUserRole(userId, newRole);
    refreshUsers();
  };

  const handleDeleteSingle = async (userId, userRole) => {
    if (userRole === 'admin') {
      alert("Không thể xóa tài khoản Admin!");
      return;
    }

    const confirm = window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?");
    if (!confirm) return;

    await deleteUsers([userId]);
    refreshUsers();
  };

  const handleDeleteBulk = async () => {
    if (selectedUserIds.length === 0) return;

    const confirm = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUserIds.length} tài khoản đã chọn không?`);
    if (!confirm) return;

    await deleteUsers(selectedUserIds);
    refreshUsers();
  };

  // Get users that are eligible for deletion (non-admins)
  const deletableUsers = users.filter(u => u.role !== 'admin');
  const isAllSelected = deletableUsers.length > 0 && deletableUsers.every(u => selectedUserIds.includes(u.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(deletableUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  return (
    <div className="admin-users-page">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>User Management</h2>
          <p>Manage user roles and permissions</p>
        </div>
        {selectedUserIds.length > 0 && (
          <button 
            onClick={handleDeleteBulk}
            className="btn-delete-bulk"
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            <Trash2 size={16} />
            Xóa các tài khoản đã chọn ({selectedUserIds.length})
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải thông tin người dùng...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingLeft: '20px' }}>
                  {deletableUsers.length > 0 && (
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  )}
                </th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ backgroundColor: selectedUserIds.includes(u.id) ? '#fef2f2' : 'transparent', transition: 'background-color 0.2s' }}>
                  <td style={{ paddingLeft: '20px' }}>
                    {u.role !== 'admin' ? (
                      <input 
                        type="checkbox" 
                        checked={selectedUserIds.includes(u.id)}
                        onChange={() => handleSelectUser(u.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    ) : (
                      <div style={{ width: '18px', height: '18px' }}></div>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: '#666' }}>{u.id}</td>
                  <td>
                    <div className="user-name">
                      <div className="user-avatar">{u.name ? u.name.charAt(0).toUpperCase() : 'U'}</div>
                      <span>{u.name || 'User'}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={currentUser?.role !== 'admin'}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteSingle(u.id, u.role)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
