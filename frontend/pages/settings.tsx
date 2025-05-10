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
  EyeOff
} from 'lucide-react'
import PageContainer from '@/components/layout/PageContainer'

// Validation schema for profile update
const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  currency: z.string().min(1, "Currency is required"),
  language: z.string().min(1, "Language is required")
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
      currency: user?.preferred_currency || 'USD',
      language: 'en'
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
        // Not sending language as the backend might not support it yet
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
        currency: updatedUser.preferred_currency,
        language: 'en' // Default until backend supports it
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
  
  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ru', name: 'Russian' }
  ]
  
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
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-purple-100 max-w-3xl">
            Manage your profile, security, and preferences to personalize your experience.
          </p>
        </div>
      </div>
      
      {updateSuccess && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-center">
          <div className="flex-shrink-0 mr-3">
            <Check className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-green-700">{updateSuccess}</p>
          </div>
        </div>
      )}
      
      {updateError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center">
          <div className="flex-shrink-0 mr-3">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-red-700">{updateError}</p>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="profile" className="space-y-6" onValueChange={setActiveTab}>
        <Card>
          <TabsList className="w-full grid grid-cols-3 h-14 rounded-b-none bg-muted/50">
            <TabsTrigger value="profile" className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>
        </Card>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <div className="p-6">
              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center mb-4">
                    <User className="h-5 w-5 mr-2 text-indigo-500" />
                    Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        placeholder="John"
                        {...registerProfile('first_name')}
                        className={profileErrors.first_name ? 'border-red-500' : ''}
                      />
                      {profileErrors.first_name && (
                        <p className="text-sm text-red-500">{profileErrors.first_name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        placeholder="Doe"
                        {...registerProfile('last_name')}
                        className={profileErrors.last_name ? 'border-red-500' : ''}
                      />
                      {profileErrors.last_name && (
                        <p className="text-sm text-red-500">{profileErrors.last_name.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-1.5 text-indigo-500" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      {...registerProfile('email')}
                      className={profileErrors.email ? 'border-red-500' : ''}
                    />
                    {profileErrors.email && (
                      <p className="text-sm text-red-500">{profileErrors.email.message}</p>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-semibold flex items-center mb-4 mt-8">
                    <Database className="h-5 w-5 mr-2 text-indigo-500" />
                    Preferences
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <select
                        id="currency"
                        {...registerProfile('currency')}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.name}
                          </option>
                        ))}
                      </select>
                      {profileErrors.currency && (
                        <p className="text-sm text-red-500">{profileErrors.currency.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        {...registerProfile('language')}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        {languages.map((language) => (
                          <option key={language.code} value={language.code}>
                            {language.name}
                          </option>
                        ))}
                      </select>
                      {profileErrors.language && (
                        <p className="text-sm text-red-500">{profileErrors.language.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
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
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <div className="p-6">
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center mb-4">
                    <Lock className="h-5 w-5 mr-2 text-indigo-500" />
                    Change Password
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current_password"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...registerPassword('current_password')}
                          className={passwordErrors.current_password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.current_password && (
                        <p className="text-sm text-red-500">{passwordErrors.current_password.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new_password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...registerPassword('new_password')}
                          className={passwordErrors.new_password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.new_password && (
                        <p className="text-sm text-red-500">{passwordErrors.new_password.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        placeholder="••••••••"
                        {...registerPassword('confirm_password')}
                        className={passwordErrors.confirm_password ? 'border-red-500' : ''}
                      />
                      {passwordErrors.confirm_password && (
                        <p className="text-sm text-red-500">{passwordErrors.confirm_password.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
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
                  </div>
                </div>
              </form>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold flex items-center text-red-600 mb-4">
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Account
              </h2>
              
              <p className="text-sm text-gray-500 mb-4">
                Permanently delete your account and all of your data. This action cannot be undone.
              </p>
              
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold flex items-center mb-6">
                <Bell className="h-5 w-5 mr-2 text-indigo-500" />
                Notification Settings
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <div className="text-sm text-gray-500">
                      Receive important updates and summaries via email
                    </div>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Label className="text-base">Push Notifications</Label>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <Smartphone className="mr-1 h-3 w-3" />
                        Mobile
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Get real-time alerts on your device
                    </div>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Monthly Reports</Label>
                        <div className="text-sm text-gray-500">
                          Receive a monthly summary of your spending
                        </div>
                      </div>
                      <Switch
                        checked={monthlyReports}
                        onCheckedChange={setMonthlyReports}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Budget Alerts</Label>
                        <div className="text-sm text-gray-500">
                          Get notified when you're approaching budget limits
                        </div>
                      </div>
                      <Switch
                        checked={budgetAlerts}
                        onCheckedChange={setBudgetAlerts}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="button" 
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Notification Preferences
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
} 