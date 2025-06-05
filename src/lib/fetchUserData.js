"use client"


export async function fetchUserData(getUserData){
    const { data, error } = await getUserData();
    if (error) {
      console.error('Error fetching user data:', error);
      return;
    }
    return data;
}