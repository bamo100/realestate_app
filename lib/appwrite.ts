import {Account, Avatars, Client, OAuthProvider} from "react-native-appwrite";
import * as Linking from 'expo-linking';
import { openAuthSessionAsync } from "expo-web-browser";

export const config =  {
    platform: 'restate android',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    project_id: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    database_id: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleries_collection_id: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    reviews_collection_id: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    agents_collection_id: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    properties_collection_id: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.project_id!)
    .setPlatform(config.platform)

export const account = new Account(client)
export const avatar = new Avatars(client)
export const databases = new Databases(client)

export async function login() {
    try {
        //this redirects the user to the app`s homepage
        const redirectUri = Linking.createURL('/')

        //Request an OAuth token from Appwrite using google provider
        const response = await account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri
        )

        //check if no response exists
        if(!response) throw new Error('Failed to Login')

        //if succssadful, redirect the user to the google login page in a web page within the app
        const browserResult = await openAuthSessionAsync(
            //response from google
            response.toString(),
            //redirect url
            redirectUri 
        )

        //check if the browser result is not successful
        if(browserResult.type !== 'success') throw new Error('Failed to Login')

        //parse the url from the browser result
        const url = new URL(browserResult.url)

        //extract the secret and userId from the url
        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        //check if the secret and userId exist
        if(!secret || !userId) throw new Error('Failed to Login')

        //create account session
        const session = await account.createSession(userId, secret);

        if(!session) throw new Error('Failed to create session')

        return true;
    } catch (error) {
        console.error(error)
        return false
    }
}

export async function logout() {
    try {
        await account.deleteSession('current')
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export async function getCurrentUser() {
    try {
        const response = await account.get();

        if(response.$id) {
            const userAvatar = avatar.getInitials(response.name);

            return {
                ...response,
                avatar: userAvatar.toString()
            }
        }
        return null;
    } catch (error) {
        console.error(error)        
        return null;   
    }
}
