import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// AuthProvider holds { member, token, role } and exposes login()/logout()
export const AuthProvider = ({ children }) => {
  const [member, setMember] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fitzone_member')) || null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('fitzone_token') || null)

  // login stores member + JWT in state AND localStorage so refresh keeps you logged in
  const login = (memberData, jwt) => {
    setMember(memberData)
    setToken(jwt)
    localStorage.setItem('fitzone_member', JSON.stringify(memberData))
    localStorage.setItem('fitzone_token', jwt)
  }

  // logout clears both state and storage
  const logout = () => {
    setMember(null)
    setToken(null)
    localStorage.removeItem('fitzone_member')
    localStorage.removeItem('fitzone_token')
  }

  // role is derived from the member object
  const role = member ? member.role || 'member' : null

  return (
    <AuthContext.Provider value={{ member, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)