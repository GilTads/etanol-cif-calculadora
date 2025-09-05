import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { destinationLat, destinationLng } = await req.json()
    
    const PLANT_COORDINATES = {
      lat: -22.2263333,
      lng: -53.3390000
    }

    // Obter a chave da API do Google Maps dos secrets
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')
    
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured')
    }

    // Usar Google Maps Directions API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${PLANT_COORDINATES.lat},${PLANT_COORDINATES.lng}&destination=${destinationLat},${destinationLng}&key=${GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Error fetching directions from Google Maps')
    }

    const data = await response.json()
    
    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found')
    }

    // Distância em metros, converter para quilômetros
    const distanceInMeters = data.routes[0].legs[0].distance.value
    const distanceInKm = Math.round(distanceInMeters / 1000)

    return new Response(
      JSON.stringify({ distance: distanceInKm }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error calculating distance:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: true 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})