import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { userAPI } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Database, 
  Check, 
  Loader2, 
  ShieldCheck, 
  Trash2,
  Smartphone,
  Eye,
  EyeOff,
  Settings2,
  AlertTriangle
} from 'lucide-react'
import PageContainer from '@/components/layout/PageContainer'

// Validation schema for profile update
const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  currency: z.string().min(1, "Currency is required")
})

// Validation schema for password update
const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirm_password: z.string().min(1, "Please confirm your password")
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"]
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { user, updateUserData } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [monthlyReports, setMonthlyReports] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  
  // Profile form
  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit, 
    formState: { errors: profileErrors },
    reset: resetProfileForm
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      currency: user?.preferred_currency || 'USD'
    }
  })
  
  // Password form
  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    formState: { errors: passwordErrors }, 
    reset: resetPasswordForm
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  })
  
  async function onProfileSubmit(data: ProfileFormValues) {
    setIsUpdating(true)
    setUpdateSuccess('')
    setUpdateError('')
    
    try {
      // Call API to update user profile - convert to format expected by API
      const updatedUser = await userAPI.updateCurrentUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        preferred_currency: data.currency
      })
      
      // Update user in AuthContext
      updateUserData(updatedUser)
      
      // Show success message
      setUpdateSuccess('Profile updated successfully')
      
      // Reset form with new values
      resetProfileForm({
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        currency: updatedUser.preferred_currency
      })
      
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setIsUpdating(false)
      
      // Clear success message after 3 seconds
      if (updateSuccess) {
        setTimeout(() => {
          setUpdateSuccess('')
        }, 3000)
      }
    }
  }
  
  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsUpdating(true)
    setUpdateSuccess('')
    setUpdateError('')
    
    try {
      // Call API to update password - using the existing updateCurrentUser method
      await userAPI.updateCurrentUser({
        current_password: data.current_password,
        new_password: data.new_password
      })
      
      // Show success message
      setUpdateSuccess('Password updated successfully')
      
      // Reset form
      resetPasswordForm()
      
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update password')
      console.error('Error updating password:', error)
    } finally {
      setIsUpdating(false)
      
      // Clear success message after 3 seconds
      if (updateSuccess) {
        setTimeout(() => {
          setUpdateSuccess('')
        }, 3000)
      }
    }
  }
  
  async function handleDeleteAccount() {
    // This would typically show a confirmation modal
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
    
    if (confirmed) {
      try {
        // Use general API method since we don't have a specific deleteAccount method
        await userAPI.updateCurrentUser({
          delete_account: true
        })
        // Handle successful deletion (redirect to login page)
        window.location.href = '/login'
      } catch (error) {
        console.error('Error deleting account:', error)
        alert('Failed to delete account. Please try again.')
      }
    }
  }
  
  // Currency options
  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'RUB', name: 'Russian Ruble (₽)' },
    { code: 'CNY', name: 'Chinese Yuan (¥)' }
  ]
  
  return (
    <PageContainer>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Settings2 className="h-8 w-8 mr-3" />
              Account Settings
            </h1>
            <p className="text-purple-100 max-w-3xl">
              Manage your profile, security, and preferences to personalize your experience.
            </p>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence mode="wait">
      {updateSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-center"
          >
          <div className="flex-shrink-0 mr-3">
            <Check className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-green-700">{updateSuccess}</p>
          </div>
          </motion.div>
      )}
      
      {updateError && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center"
          >
          <div className="flex-shrink-0 mr-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-red-700">{updateError}</p>
          </div>
          </motion.div>
      )}
      </AnimatePresence>
      
      <Tabs defaultValue="profile" className="space-y-6" onValueChange={setActiveTab}>
        <Card className="border-none shadow-lg">
          <TabsList className="w-full grid grid-cols-2 h-16 rounded-b-none bg-gradient-to-r from-purple-50 to-indigo-50">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
        </Card>
        
        <TabsContent value="profile" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="p-6">
              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
                        <h2 className="text-2xl font-bold flex items-center mb-6 text-indigo-900">
                          <User className="h-6 w-6 mr-3 text-indigo-600" />
                    Personal Information
                  </h2>
                  
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700">First Name</Label>
                            <div className="relative group">
                      <Input
                        id="first_name"
                        placeholder="John"
                        {...registerProfile('first_name')}
                                className={`${profileErrors.first_name ? 'border-red-500' : 'border-gray-200'} 
                                  transition-all duration-200 
                                  hover:border-indigo-300 
                                  focus:border-indigo-500 
                                  focus:ring-2 focus:ring-indigo-200
                                  bg-white/50 backdrop-blur-sm
                                  group-hover:bg-white
                                  shadow-sm`}
                              />
                              <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-inset ring-gray-200 group-hover:ring-indigo-300 transition-all duration-200"></div>
                            </div>
                            <AnimatePresence>
                      {profileErrors.first_name && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="text-sm text-red-500 mt-1"
                                >
                                  {profileErrors.first_name.message}
                                </motion.p>
                      )}
                            </AnimatePresence>
                          </motion.div>
                    
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700">Last Name</Label>
                            <div className="relative group">
                      <Input
                        id="last_name"
                        placeholder="Doe"
                        {...registerProfile('last_name')}
                                className={`${profileErrors.last_name ? 'border-red-500' : 'border-gray-200'} 
                                  transition-all duration-200 
                                  hover:border-indigo-300 
                                  focus:border-indigo-500 
                                  focus:ring-2 focus:ring-indigo-200
                                  bg-white/50 backdrop-blur-sm
                                  group-hover:bg-white
                                  shadow-sm`}
                              />
                              <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-inset ring-gray-200 group-hover:ring-indigo-300 transition-all duration-200"></div>
                            </div>
                            <AnimatePresence>
                      {profileErrors.last_name && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="text-sm text-red-500 mt-1"
                                >
                                  {profileErrors.last_name.message}
                                </motion.p>
                      )}
                            </AnimatePresence>
                          </motion.div>
                  </div>
                  
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          className="mt-8 space-y-2"
                        >
                          <Label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700">
                            <Mail className="h-4 w-4 mr-2 text-indigo-600" />
                      Email Address
                    </Label>
                          <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      {...registerProfile('email')}
                              className={`${profileErrors.email ? 'border-red-500' : 'border-gray-200'} 
                                transition-all duration-200 
                                hover:border-indigo-300 
                                focus:border-indigo-500 
                                focus:ring-2 focus:ring-indigo-200
                                bg-white/50 backdrop-blur-sm
                                group-hover:bg-white
                                shadow-sm`}
                            />
                            <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-inset ring-gray-200 group-hover:ring-indigo-300 transition-all duration-200"></div>
                          </div>
                          <AnimatePresence>
                    {profileErrors.email && (
                              <motion.p 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-sm text-red-500 mt-1"
                              >
                                {profileErrors.email.message}
                              </motion.p>
                    )}
                          </AnimatePresence>
                        </motion.div>
                  </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
                        <h2 className="text-2xl font-bold flex items-center mb-6 text-indigo-900">
                          <Database className="h-6 w-6 mr-3 text-indigo-600" />
                    Preferences
                  </h2>
                  
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="currency" className="text-sm font-semibold text-gray-700">Default Currency</Label>
                            <div className="relative group">
                      <select
                        id="currency"
                        {...registerProfile('currency')}
                                className="w-full rounded-md border-gray-200 shadow-sm 
                                  transition-all duration-200 
                                  hover:border-indigo-300 
                                  focus:border-indigo-500 
                                  focus:ring-2 focus:ring-indigo-200
                                  bg-white/50 backdrop-blur-sm
                                  group-hover:bg-white
                                  appearance-none
                                  pl-3 pr-10 py-2"
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.name}
                          </option>
                        ))}
                      </select>
                              <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-inset ring-gray-200 group-hover:ring-indigo-300 transition-all duration-200"></div>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <AnimatePresence>
                      {profileErrors.currency && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="text-sm text-red-500 mt-1"
                                >
                                  {profileErrors.currency.message}
                                </motion.p>
                      )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                    </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="pt-6"
                    >
                    <Button 
                      type="submit" 
                        className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    </motion.div>
                </div>
              </form>
            </div>
          </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="p-6">
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
                        <h2 className="text-2xl font-bold flex items-center mb-6 text-indigo-900">
                          <Lock className="h-6 w-6 mr-3 text-indigo-600" />
                    Change Password
                  </h2>
                  
                        <div className="space-y-6">
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="current_password" className="text-sm font-semibold text-gray-700">Current Password</Label>
                            <div className="relative group">
                        <Input
                          id="current_password"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...registerPassword('current_password')}
                                className={`${passwordErrors.current_password ? 'border-red-500' : 'border-gray-200'} 
                                  pr-10 transition-all duration-200 
                                  hover:border-indigo-300 
                                  focus:border-indigo-500 
                                  focus:ring-2 focus:ring-indigo-200
                                  bg-white/50 backdrop-blur-sm
                                  group-hover:bg-white
                                  shadow-sm`}
                              />
                              <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-inset ring-gray-200 group-hover:ring-indigo-300 transition-all duration-200"></div>
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                            <AnimatePresence>
                      {passwordErrors.current_password && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="text-sm text-red-500 mt-1"
                                >
                                  {passwordErrors.current_password.message}
                                </motion.p>
                      )}
                            </AnimatePresence>
                          </motion.div>
                    
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="new_password" className="text-sm font-semibold text-gray-700">New Password</Label>
                            <div className="relative group">
                        <Input
                          id="new_password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...registerPassword('new_password')}
                                className={`${passwordErrors.new_password ? 'border-red-500' : 'border-gray-200'} 
                                  pr-10 transition-all duration-200 
                                  hover:border-indigo-300 
                                  focus:border-indigo-500 
                                  focus:ring-2 focus:ring-indigo-200
                                  bg-white/50 backdrop-blur-sm
                                  group-hover:bg-white
                                  shadow-sm`}
                              />
                              <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-inset ring-gray-200 group-hover:ring-indigo-300 transition-all duration-200"></div>
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                            <AnimatePresence>
                      {passwordErrors.new_password && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="text-sm text-red-500 mt-1"
                                >
                                  {passwordErrors.new_password.message}
                                </motion.p>
                      )}
                            </AnimatePresence>
                          </motion.div>
                    
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="confirm_password" className="text-sm font-semibold text-gray-700">Confirm New Password</Label>
                            <div className="relative group">
                      <Input
                        id="confirm_password"
                        type="password"
                        placeholder="••••••••"
                        {...registerPassword('confirm_password')}
                                className={`${passwordErrors.confirm_password ? 'border-red-500' : 'border-gray-200'} 
                                  transition-all duration-200 
                                  hover:border-indigo-300 
                                  focus:border-indigo-500 
                                  focus:ring-2 focus:ring-indigo-200
                                  bg-white/50 backdrop-blur-sm
                                  group-hover:bg-white
                                  shadow-sm`}
                              />
                              <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-inset ring-gray-200 group-hover:ring-indigo-300 transition-all duration-200"></div>
                            </div>
                            <AnimatePresence>
                      {passwordErrors.confirm_password && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="text-sm text-red-500 mt-1"
                                >
                                  {passwordErrors.confirm_password.message}
                                </motion.p>
                      )}
                            </AnimatePresence>
                          </motion.div>
                    </div>
                  </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="pt-6"
                    >
                    <Button 
                      type="submit" 
                        className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                    </motion.div>
                </div>
              </form>
            </div>
          </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="p-6">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
                  <h2 className="text-2xl font-bold flex items-center text-red-900 mb-4">
                    <Trash2 className="h-6 w-6 mr-3 text-red-600" />
                Delete Account
              </h2>
              
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Permanently delete your account and all of your data. This action cannot be undone.
              </p>
              
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                Delete Account
              </Button>
                </div>
            </div>
          </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
} 