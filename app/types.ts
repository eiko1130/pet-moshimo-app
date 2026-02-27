// app/types.ts

export interface Pet {
    id: string;
    name: string;
    image_url: string | null;
    user_id: string; // SQLで追加した「持ち主」の列
    created_at: string;
  }
  
  // 今後、飼い主情報や健康記録の型もここに追加していけます
  export interface OwnerInfo {
    id: string;
    user_id: string;
    name: string;
    // ...など
  }