import { supabase } from '../integrations/supabase/client';
import { Base } from '../types';

export class SupabaseService {
  async initialize(): Promise<void> {
    // No initialization needed for Supabase
  }

  async getBases(): Promise<Base[]> {
    try {
      const { data, error } = await supabase
        .from('bases' as any)
        .select('*') as any;
      
      if (error) {
        console.error('Error fetching bases:', error);
        return [];
      }
      
      return (data || []) as Base[];
    } catch (error) {
      console.error('Error fetching bases:', error);
      return [];
    }
  }

  async addBase(base: Omit<Base, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('bases' as any)
      .insert([base]);
    
    if (error) {
      console.error('Error adding base:', error);
      throw error;
    }
  }

  async updateBase(id: string, base: Omit<Base, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('bases' as any)
      .update(base)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating base:', error);
      throw error;
    }
  }

  async deleteBase(id: string): Promise<void> {
    const { error } = await supabase
      .from('bases' as any)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting base:', error);
      throw error;
    }
  }

  async getBase(id: string): Promise<Base | null> {
    try {
      const { data, error } = await supabase
        .from('bases' as any)
        .select('*')
        .eq('id', id) as any;
      
      if (error) {
        console.error('Error fetching base:', error);
        return null;
      }
      
      return (data && data.length > 0 ? data[0] : null) as Base | null;
    } catch (error) {
      console.error('Error fetching base:', error);
      return null;
    }
  }

  async getSetting(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('settings' as any)
        .select('value')
        .eq('key', key) as any;
      
      if (error) {
        return null;
      }
      
      return (data && data.length > 0 ? data[0].value : null) as string | null;
    } catch (error) {
      return null;
    }
  }

  async setSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('settings' as any)
      .upsert({ key, value });
    
    if (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();