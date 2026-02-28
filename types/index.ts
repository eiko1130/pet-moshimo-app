export type Pet = {
  id: string
  user_id: string
  name: string
  species: string
  birthday: string | null
  photo_url: string | null
  notes: string | null
  created_at: string
}

export type PetRecord = {
  id: string
  user_id: string
  pet_id: string
  type: 'medical' | 'daily' | 'memory'
  mood: 'good' | 'normal' | 'bad' | null
  content: string | null
  image_url: string | null
  date: string
  created_at: string
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
