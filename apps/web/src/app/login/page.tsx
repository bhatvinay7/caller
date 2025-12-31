"use client"

import React from 'react'
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label
} from 'chat-ui'
import Link from 'next/link'

export default function Login() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-100 shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Enter your email and password to sign in
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-zinc-400 dark:focus:ring-zinc-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</Label>
                            <Link href="#" className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-zinc-400 dark:focus:ring-zinc-700"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
                        Sign in
                    </Button>
                    <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-zinc-900 dark:text-white hover:underline">
                            Create an account
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
