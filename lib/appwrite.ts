import {Account, Avatars, Client, OAuthProvider, Databases, Query} from "react-native-appwrite";
import * as Linking from 'expo-linking';
import { openAuthSessionAsync } from "expo-web-browser";

export const config =  {
    platform: 'restate android',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    project_id: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleries_collection_id: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
    reviews_collection_id: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
    agents_collection_id: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
    properties_collection_id: process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
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

export async function getLatestProperties() {
    try {
        const result = await databases.listDocuments(
            config.databaseId!,
            config.properties_collection_id!,
            [Query.orderAsc('$createdAt'), Query.limit(5)]
        )

        return result.documents;
    } catch (error) {
        console.error(error)
        return[];
    }
}

export async function getProperties({filter, query, limit}: {
    filter: string,
    query: string, 
    limit?: number
}) {
    try {
        const buildQuery = [Query.orderAsc('$createdAt')];

        if(filter && filter !== 'All') {
            buildQuery.push(Query.equal('type', filter));
        }

        if(query) {
            buildQuery.push(
                Query.or( [
                        Query.search('name', query),
                        Query.search('address', query),
                        Query.search('type', query),
                    ]
                )
            )
        }

        if(limit) {
            buildQuery.push(Query.limit(limit))
        }

        const result = await databases.listDocuments(
            config.databaseId!,
            config.properties_collection_id!,
            buildQuery
        )

        return result.documents;
    } catch (error) {
        console.error(error);
        return [];
    }
}