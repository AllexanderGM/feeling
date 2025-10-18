#!/bin/bash

FILE="src/pages/user/profile/UserDetail.jsx"

# Cambiar la sección de Bio - cambiar el icono y el fondo
sed -i 's/bg-gradient-to-br from-gray-800\/40 to-gray-900\/40 backdrop-blur-sm border border-gray-700\/30/bg-gray-800\/50 backdrop-blur-sm border border-gray-700\/30/g' "$FILE"
sed -i 's/<div className='\''w-8 h-8 bg-purple-500\/20 rounded-full flex items-center justify-center'\''>//' "$FILE"
sed -i 's/<Users className='\''w-4 h-4 text-purple-400'\'' \/>/&/' "$FILE"
sed -i 's/<\/div>//' "$FILE"
sed -i 's/font-bold/font-medium/g' "$FILE"
sed -i 's/p-4/p-4 sm:p-6/g' "$FILE"

# Cambiar indicadores de match status
sed -i 's/bg-gradient-to-r from-green-500\/80 to-emerald-500\/80 backdrop-blur-md border border-green-300\/40/bg-green-500\/20 text-green-300 border border-green-500\/30/g' "$FILE"
sed -i 's/bg-gradient-to-r from-yellow-500\/80 to-orange-500\/80 backdrop-blur-md border border-yellow-300\/40/bg-yellow-500\/20 text-yellow-300 border border-yellow-500\/30/g' "$FILE"

# Cambiar galería - icono y grid
sed -i 's/bg-pink-500\/20/bg-blue-400/g' "$FILE"
sed -i 's/text-pink-400/text-blue-400/g' "$FILE"
sed -i 's/grid grid-cols-2 gap-2/grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2/g' "$FILE"
sed -i 's/aspect-square//g' "$FILE"

echo "Changes applied successfully"
