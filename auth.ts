import NextAuth from "next-auth"
import authConfig from "./auth.config";
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from "./lib/db";
import { getUserById } from "./data/user";
import { UserRole } from "@prisma/client";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";


export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  adapter: PrismaAdapter(db),
  pages:{
    signIn: '/auth/login',
    error: 'auth/error'
  },
  events: {
    async linkAccount({user}){
      await db.user.update({
        where: { id : user.id },
        data: { emailVerified: new Date()}
      })
    }
  },
  callbacks: {
    async signIn({user, account}){
      if(account?.provider !== "credentials") return true;
      const existingUser = await getUserById(user.id as string);
        //Prevent sign in without email verification
        if(!existingUser?.emailVerified) return false;
        //TODO: Add 2FA check
        if(existingUser.isTwoFactorEnabled){
          const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
          if(!twoFactorConfirmation) return false;
  
          //Delete 2FA for next login
          await db.twoFactorConfirmation.delete({
            where: {id: twoFactorConfirmation.id}
          })
        }      
      
      return true;
    },
    async session({token, session}){
        if(token.sub && session.user){
            session.user.id = token.sub
        }
        if(token.role && session.user){
            session.user.role = token.role as UserRole
        }
        if(session.user){
            session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        }
        if(session.user){
          session.user.name = token.name
          session.user.email = token.email as string
          session.user.isOAuth = token.isOAuth as boolean
        }
        return session
    },
    async jwt({token}){
        if(!token.sub) return token;
        const existingUser = await getUserById(token.sub);
        if(!existingUser) return token

        const existingAccount = await getAccountByUserId(existingUser.id)

        token.isOAuth = !!existingAccount
        token.name = existingUser.name
        token.email = existingUser.email
        token.role = existingUser.role
        token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled
        return token
    }
  }
})