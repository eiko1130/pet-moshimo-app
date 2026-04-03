export type Pet = {
  id: string
  user_id: string
  name: string
  species: string | null
  birth_year: number | null
  birth_month: number | null
  birth_day: number | null
  photo_url: string | null
  image_url: string | null
  vaccine_info: string | null
  insurance_info: string | null
  pet_message: string | null
  notes: string | null
  created_at: string
}

export type PetRecord = {
  id: string
  user_id: string
  pet_id: string
  mood: 'good' | 'normal' | 'bad' | null
  memo: string | null
  image_url: string | null
  extra_pet_ids: string[] | null
  date: string
  created_at: string
  // 記録項目
  weight: number | null
  temperature: number | null
  no_appetite: boolean | null
  no_appetite_note: string | null
  abnormal_excretion: boolean | null
  abnormal_excretion_note: string | null
  vomit: boolean | null
  vomit_note: string | null
  nail_trimming: boolean | null
  nail_trimming_note: string | null
  free_item1_value: boolean | null
  free_item1_note: string | null
  free_item2_value: boolean | null
  free_item2_note: string | null
  free_item3_value: boolean | null
  free_item3_note: string | null
  pet?: Pet
}

export type OwnerInfo = {
  id: string
  user_id: string
  full_name: string | null
  address: string | null
  emergency_msg: string | null
  key_location: string | null
  vet_name: string | null
  vet_phone: string | null
  insurance_company: string | null
  insurance_number: string | null
  vaccine_date: string | null
  vaccine_type: string | null
}

export type EmergencyContact = {
  id: string
  user_id: string
  name: string
  relationship: string | null
  phone: string | null
  email: string | null
  priority: number
  consent: boolean
}