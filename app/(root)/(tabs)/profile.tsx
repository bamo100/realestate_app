import { View, Text, ScrollView, Image, TouchableOpacity, ImageSourcePropType, Alert } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '@/constants/icons'
import images from '@/constants/images'
import { settings } from '@/constants/data'
import { useGlobalContext } from '@/lib/global-provider'
import { logout } from '@/lib/appwrite'

interface SettingItemsProps {
  title: string;
  icon: ImageSourcePropType;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({title, icon, onPress, textStyle, showArrow}: SettingItemsProps) => (
  <TouchableOpacity onPress={onPress} className='flex flex-row justify-between items-center py-3'>
    <View className='flex flex-row items-center gap-3'>
      <Image source={icon} className='size-6' />
      <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`}>
        {title}
      </Text>
    </View>
    {showArrow && (
      <Image source={icons.rightArrow} className='size-5' />
    )}
  </TouchableOpacity>
)

const Profile = () => {
  //fetch user data from the global context
  const {user, refetch} = useGlobalContext();

  const handleLogout = async () => {
    //this function is called when the user clicks the logout
    const result = await logout();

    if(result) {
      Alert.alert('Success','You have been logged out Successfully')
      refetch({})
    } else {
      Alert.alert('Error','Failed to Logout')
    }

  }
  return (
    <SafeAreaView className='h-full bg-white'>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        contentContainerClassName='px-7 pb-32'
      >
        <View className='flex flex-row justify-between items-center mt-5'>
          <Text className='text-xl font-rubik-bold'>
            Profile
          </Text>
          <Image source={icons.bell} className='size-5' />
        </View>

        <View className='flex flex-row justify-center mt-5'>
          <View className='flex flex-col items-center'>
            <Image source={{uri: user?.avatar}} className='size-44 relative rounded-full' />
            <TouchableOpacity className='absolute bottom-11 right-2'>
              <Image source={icons.edit} className='size-9' />
            </TouchableOpacity>
            <Text className='text-2xl font-rubik-bold mt-2'>
              {user?.name}
            </Text>
          </View>
        </View>

        <View className='flex flex-col mt-10'>
          <SettingsItem title='My Bookings' icon={icons.calendar} />
          <SettingsItem title='Payments' icon={icons.wallet} />
        </View>

        <View className='flex flex-col mt-5 border-t pt-5 border-primary-200'>
          {settings.slice(2).map((item, index) => (
            <SettingsItem key={index} {...item} />
          ))}
        </View>

        <View className='flex flex-col mt-5 border-t pt-5 border-primary-200'>
            <SettingsItem icon={icons.logout} title='Logout' textStyle='text-danger' onPress={handleLogout} showArrow={false}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile