import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/utils/supabase/client'
import { UserRole } from '@/types'
import bcryptjs from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Fetch user from Supabase
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !user) {
          return null
        }

        // Verify password with bcryptjs
        console.log('Attempting to verify password...')
        console.log('Hash from DB:', user.password_hash)
        console.log('Plain password:', credentials.password)
        
        const passwordMatch = await bcryptjs.compare(credentials.password, user.password_hash)
        console.log('Password match result:', passwordMatch)
        
        // If comparison fails, try re-hashing to debug
        if (!passwordMatch) {
          console.log('Password mismatch - generating test hash for debugging')
          const testHash = await bcryptjs.hash(credentials.password, 10)
          console.log('Test hash of provided password:', testHash)
          console.log('Does test hash match DB hash?', testHash === user.password_hash)
        }

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email as string
        token.name = user.name  as string
        token.role = (user as { role?: UserRole }).role
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as UserRole
      }
      return session
    }
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
}