"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'view' | 'system' | 'approval';
    read: boolean;
    link?: string;
    created_at: string;
};

export async function getNotifications() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching notifications. Table might not exist yet:", error);
        return [];
    }

    return data as Notification[];
}

export async function markNotificationAsRead(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

    if (error) {
        console.error("Error marking notification as read:", error);
        return false;
    }

    revalidatePath('/proposals');
    return true;
}

export async function createNotification(title: string, message: string, type: string, link?: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .insert({
            title,
            message,
            type,
            link,
            read: false
        });

    if (error) {
        // Silently fail if table doesn't exist yet to avoid crashing public view
        console.warn("Notification system disabled or table missing.");
        return false;
    }

    return true;
}
