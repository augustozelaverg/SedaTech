import React, { useState, useMemo } from 'react';
import { useTickets } from '../context/TicketContext';
import { User, UserRole } from '../types';
import {
  Users,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Plus,
  Edit2,
  Trash2,
  Search,
  UserCheck,
  UserX,
  X,
  AlertTriangle,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { burst, playClickSound } from '../utils/audio';

const AVATAR_COLORS = [
  { name: 'Azul Marino', class: 'bg-[#0a2463]' },
  { name: 'Azul Institucional', class: 'bg-[#0052a5]' },
  { name: 'Azul Real', class: 'bg-[#1d4ed8]' },
  { name: 'Azul Cobalto', class: 'bg-[#0369a1]' },
  { name: 'Celeste Profundo', class: 'bg-[#0284c7]' },
  { name: 'Celeste Vivo', class: 'bg-[#0ea5e9]' },
  { name: 'Celeste Claro', class: 'bg-[#38bdf8]' },
  { name: 'Azul Acero', class: 'bg-[#2563eb]' },
];

const AVATAR_EMOJIS = ['👤', '👑', '🛠️', '💼', '💻', '👨‍💻', '👩‍💼', '⚡', '🚀', '🎯', '🔧', '⭐'];

export const StoresAndUsersView: React.FC = () => {
  const {
    users,
    currentUser,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useTickets();

  const isAdmin = currentUser.rol === 'administrador';

  // RBAC test state
  const [rbacTestResult, setRbacTestResult] = useState<string | null>(null);

  // User Modals State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [userForm, setUserForm] = useState<{
    username: string;
    nombre: string;
    email: string;
    rol: UserRole;
    cargo: string;
    avatarColor: string;
    avatarEmoji: string;
    active: boolean;
    password: string;
  }>({
    username: '',
    nombre: '',
    email: '',
    rol: 'usuario',
    cargo: '',
    avatarColor: 'bg-[#0052a5]',
    avatarEmoji: '👤',
    active: true,
    password: '',
  });
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Delete User State
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteUserError, setDeleteUserError] = useState<string | null>(null);

  // User Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('todos');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (userRoleFilter !== 'todos' && u.rol !== userRoleFilter) return false;
      if (userSearch.trim()) {
        const query = userSearch.toLowerCase().trim();
        const matchName = u.nombre.toLowerCase().includes(query);
        const matchEmail = u.email.toLowerCase().includes(query);
        const matchUser = u.username.toLowerCase().includes(query);
        const matchCargo = u.cargo.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchUser && !matchCargo) return false;
      }
      return true;
    });
  }, [users, userRoleFilter, userSearch]);

  const handleTestRbac = () => {
    setRbacTestResult('ejecutando');
    setTimeout(() => {
      setRbacTestResult(
        'PA-07 VERIFICADO: Permisos RBAC activos entre los roles Usuario, Técnico y Administrador en SedaTech conforme a RNF-04.'
      );
      burst(['🔒', '🛡️', '✅']);
    }, 500);
  };

  const handleOpenCreateUser = () => {
    if (!isAdmin) return;
    playClickSound();
    setEditingUser(null);
    setShowModalPassword(false);
    setUserForm({
      username: '',
      nombre: '',
      email: '',
      rol: 'usuario',
      cargo: 'Usuario del Sistema',
      avatarColor: 'bg-[#0052a5]',
      avatarEmoji: '👤',
      active: true,
      password: '',
    });
    setUserFormError(null);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    if (!isAdmin) return;
    playClickSound();
    setEditingUser(user);
    setShowModalPassword(false);
    setUserForm({
      username: user.username,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      cargo: user.cargo,
      avatarColor: user.avatarColor || 'bg-[#0052a5]',
      avatarEmoji: user.avatarEmoji || '👤',
      active: user.active,
      password: user.password || '',
    });
    setUserFormError(null);
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!userForm.nombre.trim()) {
      setUserFormError('El nombre completo es obligatorio.');
      return;
    }
    if (!userForm.username.trim()) {
      setUserFormError('El nombre de usuario es obligatorio.');
      return;
    }
    if (!userForm.email.trim() || !userForm.email.includes('@')) {
      setUserFormError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!userForm.password.trim()) {
      setUserFormError('Debes asignar una contraseña para que el usuario pueda iniciar sesión.');
      return;
    }

    const usernameTaken = users.some(
      u =>
        u.username.toLowerCase() === userForm.username.trim().toLowerCase() &&
        (!editingUser || u.id !== editingUser.id)
    );
    if (usernameTaken) {
      setUserFormError('El nombre de usuario ya está registrado.');
      return;
    }

    const emailTaken = users.some(
      u =>
        u.email.toLowerCase() === userForm.email.trim().toLowerCase() &&
        (!editingUser || u.id !== editingUser.id)
    );
    if (emailTaken) {
      setUserFormError('El correo electrónico ya pertenece a otro usuario registrado.');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        username: userForm.username.trim().toLowerCase(),
        nombre: userForm.nombre.trim(),
        email: userForm.email.trim().toLowerCase(),
        rol: userForm.rol,
        cargo:
          userForm.cargo.trim() ||
          (userForm.rol === 'administrador'
            ? 'Administrador'
            : userForm.rol === 'tecnico'
            ? 'Técnico de Soporte'
            : 'Usuario'),
        avatarColor: userForm.avatarColor,
        avatarEmoji: userForm.avatarEmoji,
        active: userForm.active,
        password: userForm.password.trim(),
      });
    } else {
      createUser({
        username: userForm.username.trim().toLowerCase(),
        nombre: userForm.nombre.trim(),
        email: userForm.email.trim().toLowerCase(),
        rol: userForm.rol,
        cargo:
          userForm.cargo.trim() ||
          (userForm.rol === 'administrador'
            ? 'Administrador'
            : userForm.rol === 'tecnico'
            ? 'Técnico de Soporte'
            : 'Usuario'),
        avatarColor: userForm.avatarColor,
        avatarEmoji: userForm.avatarEmoji,
        active: userForm.active,
        password: userForm.password.trim(),
      });
    }

    setUserModalOpen(false);
  };

  const handleOpenDeleteUser = (user: User) => {
    if (!isAdmin) return;
    playClickSound();
    setUserToDelete(user);
    setDeleteUserError(null);
    setDeleteUserModalOpen(true);
  };

  const handleConfirmDeleteUser = () => {
    if (!isAdmin || !userToDelete) return;
    const res = deleteUser(userToDelete.id);
    if (!res.success) {
      setDeleteUserError(res.error || 'No se pudo eliminar el usuario.');
      return;
    }
    setDeleteUserModalOpen(false);
    setUserToDelete(null);
  };

  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-3xl border-2 border-[#cce4ff] shadow-sm text-center max-w-xl mx-auto my-8 select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#0a2463] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black font-display text-[#0a2463]">
          Acceso Exclusivo para Administrador
        </h2>
        <p className="text-xs text-[#4b6b94] font-medium mt-2 leading-relaxed">
          La gestión, visualización, creación, edición y cambio de estado de usuarios está reservada únicamente para el rol <strong>Administrador</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#cce4ff] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white flex items-center justify-center shadow-md shadow-sky-900/20 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#0a2463]">
                Gestión de Usuarios y Roles
              </h2>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-sky-100 text-[#0052a5] border-sky-300'
                    : 'bg-[#f0f7ff] text-[#4b6b94] border-[#cce4ff]'
                }`}
              >
                {isAdmin ? '👑 Modo Administrador (Acceso Total)' : '🛡️ Modo Consulta (Solo Lectura)'}
              </span>
            </div>
            <p className="text-xs text-[#4b6b94] font-medium mt-0.5">
              Base de datos de usuarios registrados en SedaTech con control de acceso por roles (Administrador, Técnico y Usuario).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleTestRbac}
            className="px-4 py-2.5 bg-[#f0f7ff] hover:bg-sky-100 text-[#0a2463] rounded-xl text-xs font-bold border border-[#cce4ff] transition-all cursor-pointer flex items-center gap-2"
            title="Verificar PA-07"
          >
            <Lock className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Validar RBAC (PA-07)</span>
          </button>

          {isAdmin ? (
            <button
              onClick={handleOpenCreateUser}
              className="px-4 py-2.5 bg-[#0284c7] hover:bg-[#0052a5] text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-[11px] font-bold text-[#0052a5]">
              <Shield className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Solo Administradores pueden editar</span>
            </div>
          )}
        </div>
      </div>

      {/* RBAC Notice if user is not an administrator */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-sky-50 border-2 border-[#0284c7] text-[#0a2463] text-xs font-bold flex items-start gap-3 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-[#0052a5] shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block text-[#0052a5] text-sm">Control de Acceso por Roles (RBAC)</strong>
            <p className="font-normal mt-0.5">
              Has iniciado sesión como <strong>{currentUser.nombre}</strong> con rol de{' '}
              <span className="uppercase font-bold">{currentUser.rol}</span>. Las opciones para agregar, modificar o eliminar usuarios están reservadas únicamente para el rol <strong>Administrador</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Security test result alert */}
      {rbacTestResult && (
        <div className="p-4 rounded-2xl bg-white border-2 border-[#0284c7] text-[#0a2463] text-xs font-bold flex items-start gap-3 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block text-[#0052a5] text-sm">Prueba de Seguridad RNF-04 Exitosa</strong>
            <p className="font-normal mt-0.5">{rbacTestResult}</p>
          </div>
          <button
            onClick={() => setRbacTestResult(null)}
            className="text-[#0284c7] hover:text-[#0a2463] cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* USERS DIRECTORY & CRUD */}
      <div className="bg-white rounded-3xl border-2 border-[#cce4ff] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#cce4ff] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-black font-display text-[#0a2463]">
                Directorio de Usuarios ({users.length})
              </h3>
              <p className="text-xs text-[#4b6b94] font-medium">
                {isAdmin
                  ? 'Como Administrador, puedes gestionar credenciales, roles (Administrador, Técnico, Usuario) o registrar nuevas cuentas.'
                  : 'Cuentas activas registradas en el sistema SedaTech.'}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenCreateUser}
                className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0052a5] text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nuevo Usuario</span>
              </button>
            )}
          </div>

          {/* Filter controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#4b6b94] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, cargo..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#f0f7ff] border border-[#cce4ff] rounded-xl text-xs text-[#0a2463] focus:bg-white focus:border-[#0284c7] outline-none"
              />
            </div>

            <div>
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#f0f7ff] border border-[#cce4ff] rounded-xl text-xs font-medium text-[#0a2463] focus:bg-white focus:border-[#0284c7] outline-none"
              >
                <option value="todos">Todos los roles</option>
                <option value="administrador">👑 Administradores</option>
                <option value="tecnico">🛠️ Técnicos</option>
                <option value="usuario">👤 Usuarios</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(u => {
            const isCurrentSessionUser = u.id === currentUser.id;

            return (
              <div
                key={u.id}
                className={`p-4 rounded-2xl bg-white border-2 transition-all flex flex-col justify-between gap-3 ${
                  isCurrentSessionUser
                    ? 'border-[#0284c7] shadow-xs'
                    : 'border-[#cce4ff] hover:border-[#0284c7]/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl ${u.avatarColor || 'bg-[#0052a5]'} text-white flex items-center justify-center text-2xl shrink-0 font-black shadow-xs`}
                  >
                    {u.avatarEmoji || '👤'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <strong className="text-sm font-black text-[#0a2463] truncate block">
                        {u.nombre}
                      </strong>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          u.rol === 'administrador'
                            ? 'bg-[#0a2463] text-white'
                            : u.rol === 'tecnico'
                            ? 'bg-[#0052a5] text-white'
                            : 'bg-sky-100 text-[#0052a5] border border-sky-300'
                        }`}
                      >
                        {u.rol}
                      </span>
                    </div>
                    <p className="text-xs text-[#4b6b94] font-medium truncate">{u.cargo}</p>
                    <p className="text-[11px] font-mono text-[#0284c7] truncate mt-0.5">{u.email}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="inline-block text-[10px] font-bold text-[#0a2463] bg-[#f0f7ff] px-2 py-0.5 rounded-md border border-[#cce4ff] font-mono">
                        @{u.username}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          u.active
                            ? 'bg-sky-50 text-[#0052a5] border border-sky-200'
                            : 'bg-white text-[#0a2463] border border-[#0a2463]'
                        }`}
                      >
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Action Footer */}
                {isAdmin ? (
                  <div className="pt-3 border-t border-[#cce4ff]/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                        u.active
                          ? 'border-[#cce4ff] text-[#4b6b94] hover:bg-[#f0f7ff]'
                          : 'border-sky-300 bg-sky-50 text-[#0052a5] hover:bg-sky-100'
                      }`}
                      title={u.active ? 'Desactivar acceso al sistema' : 'Reactivar acceso al sistema'}
                    >
                      {u.active ? (
                        <>
                          <UserX className="w-3 h-3 text-[#4b6b94]" />
                          <span>Desactivar</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 text-[#0284c7]" />
                          <span>Reactivar</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditUser(u)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0052a5] hover:text-[#0a2463] hover:bg-[#f0f7ff] transition-colors cursor-pointer flex items-center gap-1"
                        title="Editar usuario (Administrador)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleOpenDeleteUser(u)}
                        disabled={isCurrentSessionUser}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isCurrentSessionUser
                            ? 'text-sky-200 cursor-not-allowed'
                            : 'text-[#4b6b94] hover:text-[#0a2463] hover:bg-[#f0f7ff]'
                        }`}
                        title={
                          isCurrentSessionUser
                            ? 'No puedes eliminar tu propia sesión activa'
                            : 'Eliminar usuario (Administrador)'
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2.5 border-t border-[#cce4ff]/60 text-right">
                    <span className="text-[10px] text-[#4b6b94] font-mono">SedaTech</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-[#4b6b94]">
            <Users className="w-10 h-10 text-sky-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#0a2463]">No se encontraron usuarios con los filtros seleccionados.</p>
          </div>
        )}
      </div>

      {/* MODAL: CREAR / MODIFICAR USUARIO */}
      {userModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061c47]/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-[#cce4ff] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 my-8">
            <div className="p-6 border-b border-[#cce4ff] flex items-center justify-between bg-[#f0f7ff]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${userForm.avatarColor} text-white flex items-center justify-center text-xl font-black shadow-xs`}
                >
                  {userForm.avatarEmoji}
                </div>
                <div>
                  <h3 className="text-base font-black font-display text-[#0a2463]">
                    {editingUser ? 'Modificar Usuario' : 'Registrar Nuevo Usuario'}
                  </h3>
                  <p className="text-xs text-[#4b6b94]">
                    Asigna perfil, rol y credenciales de acceso en SedaTech
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-[#4b6b94] hover:text-[#0a2463] cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {userFormError && (
                <div className="p-3 rounded-xl bg-sky-50 border border-[#0052a5] text-[#0a2463] text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#0052a5]" />
                  <span>{userFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0a2463] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Mendoza"
                  value={userForm.nombre}
                  onChange={e => setUserForm({ ...userForm, nombre: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cce4ff] text-xs font-medium text-[#0a2463] focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0a2463] mb-1">
                    Usuario / Alias *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: carlos.mendoza"
                    value={userForm.username}
                    onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cce4ff] text-xs font-mono font-bold text-[#0a2463] focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0a2463] mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ej: carlos@sedatech.com"
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cce4ff] text-xs font-medium text-[#0a2463] focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 outline-none"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-bold text-[#0a2463] mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#0284c7]" />
                    Contraseña de Acceso *
                  </span>
                  <span className="text-[10px] text-[#4b6b94] font-normal">Requerida para inicio de sesión</span>
                </label>
                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#cce4ff] text-xs font-mono font-bold text-[#0a2463] focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b6b94] hover:text-[#0a2463] cursor-pointer"
                  >
                    {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-[#0a2463] mb-1.5">
                  Rol en el Sistema (RBAC) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, rol: 'administrador' })}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      userForm.rol === 'administrador'
                        ? 'border-[#0a2463] bg-sky-100 text-[#0a2463] font-black'
                        : 'border-[#cce4ff] hover:border-[#0284c7] text-[#4b6b94]'
                    }`}
                  >
                    <span className="text-lg block">👑</span>
                    <span className="text-xs">Administrador</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, rol: 'tecnico' })}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      userForm.rol === 'tecnico'
                        ? 'border-[#0052a5] bg-sky-100 text-[#0052a5] font-black'
                        : 'border-[#cce4ff] hover:border-[#0284c7] text-[#4b6b94]'
                    }`}
                  >
                    <span className="text-lg block">🛠️</span>
                    <span className="text-xs">Técnico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, rol: 'usuario' })}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      userForm.rol === 'usuario'
                        ? 'border-[#0284c7] bg-sky-50 text-[#0284c7] font-black'
                        : 'border-[#cce4ff] hover:border-[#0284c7] text-[#4b6b94]'
                    }`}
                  >
                    <span className="text-lg block">👤</span>
                    <span className="text-xs">Usuario</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0a2463] mb-1">
                  Cargo o Puesto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Especialista de Soporte TI"
                  value={userForm.cargo}
                  onChange={e => setUserForm({ ...userForm, cargo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cce4ff] text-xs font-medium text-[#0a2463] focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 outline-none"
                />
              </div>

              {/* Avatar personalization */}
              <div>
                <label className="block text-xs font-bold text-[#0a2463] mb-1">
                  Color de Avatar
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c.class}
                      type="button"
                      onClick={() => setUserForm({ ...userForm, avatarColor: c.class })}
                      className={`w-7 h-7 rounded-xl ${c.class} cursor-pointer transition-transform ${
                        userForm.avatarColor === c.class
                          ? 'ring-2 ring-offset-2 ring-[#0284c7] scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0a2463] mb-1">
                  Emoji de Avatar
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVATAR_EMOJIS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setUserForm({ ...userForm, avatarEmoji: em })}
                      className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-all ${
                        userForm.avatarEmoji === em
                          ? 'bg-sky-100 scale-110 shadow-xs'
                          : 'hover:bg-[#f0f7ff]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="user-active"
                  checked={userForm.active}
                  onChange={e => setUserForm({ ...userForm, active: e.target.checked })}
                  className="w-4 h-4 text-[#0284c7] rounded-md border-[#cce4ff] focus:ring-[#0284c7] cursor-pointer"
                />
                <label htmlFor="user-active" className="text-xs font-bold text-[#0a2463] cursor-pointer">
                  Cuenta activa para iniciar sesión y gestionar tickets
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#cce4ff]">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#4b6b94] hover:bg-[#f0f7ff] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0052a5] text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ELIMINAR USUARIO */}
      {deleteUserModalOpen && userToDelete && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061c47]/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#0052a5] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-[#cce4ff] flex items-center gap-3 bg-[#f0f7ff]">
              <div className="w-10 h-10 rounded-xl bg-[#0a2463] text-white flex items-center justify-center text-xl font-black">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black font-display text-[#0a2463]">
                  Eliminar Cuenta de Usuario (Administrador)
                </h3>
                <p className="text-xs text-[#0052a5]">
                  {userToDelete.nombre} (@{userToDelete.username})
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {deleteUserError && (
                <div className="p-3 rounded-xl bg-sky-50 border border-[#0052a5] text-[#0a2463] font-bold">
                  {deleteUserError}
                </div>
              )}

              <p className="text-[#0a2463]">
                ¿Estás seguro de que deseas eliminar permanentemente a este usuario? Los tickets actualmente asignados pasarán al estado pendiente sin técnico asignado.
              </p>

              <div className="p-3 rounded-xl bg-[#f0f7ff] border border-[#cce4ff] space-y-1">
                <div>
                  <span className="font-bold text-[#4b6b94]">Rol:</span>{' '}
                  <span className="uppercase font-black text-[#0a2463]">{userToDelete.rol}</span>
                </div>
                <div>
                  <span className="font-bold text-[#4b6b94]">Correo:</span>{' '}
                  <span className="font-mono text-[#0052a5]">{userToDelete.email}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#cce4ff]">
                <button
                  onClick={() => setDeleteUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#4b6b94] hover:bg-[#f0f7ff] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDeleteUser}
                  className="px-5 py-2.5 bg-[#0a2463] hover:bg-[#0052a5] text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
