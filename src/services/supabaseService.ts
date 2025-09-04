import { supabase } from '../integrations/supabase/client';
import { Base } from '../types';

export class SupabaseService {
  async getBases(): Promise<Base[]> {
    const { data, error } = await supabase
      .from('bases')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching bases:', error);
      return [];
    }
    
    return data || [];
  }

  async addBase(base: Omit<Base, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('bases')
      .insert([base]);
    
    if (error) {
      console.error('Error adding base:', error);
      throw error;
    }
  }

  async updateBase(id: string, base: Omit<Base, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('bases')
      .update(base)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating base:', error);
      throw error;
    }
  }

  async deleteBase(id: string): Promise<void> {
    const { error } = await supabase
      .from('bases')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting base:', error);
      throw error;
    }
  }

  async getBase(id: string): Promise<Base | null> {
    const { data, error } = await supabase
      .from('bases')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching base:', error);
      return null;
    }
    
    return data;
  }

  async getSetting(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      return null;
    }
    
    return data?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value });
    
    if (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();