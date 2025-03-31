'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Car, Plus, Pencil, Trash2, Image, Check, X, Upload, ExternalLink } from 'lucide-react'

// Типы для автомобиля
type Vehicle = {
  id: number
  class: string
  brand: string
  model: string
  year: number
  seats: number
  description: string | null
  imageUrl: string | null
  amenities: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Классы автомобилей
const vehicleClasses = [
  { value: 'standard', label: 'Standart' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'business', label: 'Business' },
  { value: 'vip', label: 'VIP' },
  { value: 'minivan', label: 'Minivan' }
]

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState({
    id: 0,
    class: 'standard',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    seats: 4,
    description: '',
    imageUrl: '',
    amenities: '',
    isActive: true
  })
  const [showImagePreview, setShowImagePreview] = useState(false)

  // Загрузка списка автомобилей
  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/vehicles')
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles')
      }
      const data = await response.json()
      setVehicles(data)
    } catch (error) {
      console.error('Error loading vehicles:', error)
      toast.error('Не удалось загрузить список автомобилей')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения чекбокса
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }))
  }

  // Обработчик изменения селекта
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Открытие диалога для создания нового автомобиля
  const openCreateDialog = () => {
    setCurrentVehicle(null)
    setFormData({
      id: 0,
      class: 'standard',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      seats: 4,
      description: '',
      imageUrl: '',
      amenities: '',
      isActive: true
    })
    setIsOpenDialog(true)
    setShowImagePreview(false)
  }

  // Открытие диалога для редактирования автомобиля
  const openEditDialog = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle)
    setFormData({
      id: vehicle.id,
      class: vehicle.class,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      seats: vehicle.seats,
      description: vehicle.description || '',
      imageUrl: vehicle.imageUrl || '',
      amenities: vehicle.amenities || '',
      isActive: vehicle.isActive
    })
    setIsOpenDialog(true)
    setShowImagePreview(!!vehicle.imageUrl)
  }

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Валидация формы
    if (!formData.brand.trim() || !formData.model.trim()) {
      toast.error('Заполните обязательные поля')
      return
    }

    // Форматирование данных перед отправкой
    const vehicleData = {
      ...formData,
      year: Number(formData.year),
      seats: Number(formData.seats),
    }

    setIsSubmitting(true)
    try {
      // Определение метода запроса (POST для создания, PUT для обновления)
      const method = currentVehicle ? 'PUT' : 'POST'
      const response = await fetch('/api/vehicles', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Что-то пошло не так')
      }

      const data = await response.json()

      // Обновление списка автомобилей и вывод сообщения
      fetchVehicles()
      toast.success(currentVehicle ? 'Автомобиль успешно обновлен' : 'Автомобиль успешно добавлен')
      setIsOpenDialog(false)
    } catch (error) {
      console.error('Error saving vehicle:', error)
      toast.error(`Ошибка: ${error instanceof Error ? error.message : 'Не удалось сохранить автомобиль'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Удаление автомобиля
  const handleDelete = async (id: number) => {
    if (!confirm('Вы действительно хотите удалить этот автомобиль?')) {
      return
    }

    try {
      const response = await fetch(`/api/vehicles?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось удалить автомобиль')
      }

      // Обновление списка и вывод сообщения
      fetchVehicles()
      toast.success('Автомобиль успешно удален')
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error(`Ошибка: ${error instanceof Error ? error.message : 'Не удалось удалить автомобиль'}`)
    }
  }

  // Форматирование текста для отображения (amenities)
  const formatAmenities = (amenitiesText: string | null): string[] => {
    if (!amenitiesText) return []
    return amenitiesText.split(',').map(item => item.trim())
  }

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Car className="h-5 w-5" />
                Управление автопарком
              </CardTitle>
              <CardDescription>
                Добавление, редактирование и удаление автомобилей
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Добавить автомобиль</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Car className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Автомобили не найдены. Добавьте первый автомобиль, нажав кнопку «Добавить автомобиль».</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className={`overflow-hidden h-full ${!vehicle.isActive ? 'opacity-60' : ''}`}>
                  <div className="relative">
                    {vehicle.imageUrl ? (
                      <div
                        className="h-48 bg-cover bg-center border-b"
                        style={{ backgroundImage: `url(${vehicle.imageUrl})` }}
                      />
                    ) : (
                      <div className="h-48 bg-gray-100 flex items-center justify-center border-b">
                        <Car className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={() => openEditDialog(vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {!vehicle.isActive && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Неактивный
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 bg-primary/80 text-white px-2 py-1 rounded-tr-md text-sm">
                      {vehicleClasses.find(c => c.value === vehicle.class)?.label || vehicle.class}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-1">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <div className="text-sm text-gray-500 mb-2 flex flex-wrap gap-2">
                      <span>{vehicle.year} г.</span>
                      <span>•</span>
                      <span>{vehicle.seats} мест</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {vehicle.description}
                    </p>
                    {vehicle.amenities && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium mb-1">Удобства:</h4>
                        <div className="flex flex-wrap gap-1">
                          {formatAmenities(vehicle.amenities).slice(0, 3).map((amenity, index) => (
                            <span key={index} className="text-xs bg-gray-100 rounded-full px-2 py-0.5">
                              {amenity}
                            </span>
                          ))}
                          {formatAmenities(vehicle.amenities).length > 3 && (
                            <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">
                              +{formatAmenities(vehicle.amenities).length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог для добавления/редактирования автомобиля */}
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {currentVehicle ? 'Редактировать автомобиль' : 'Добавить новый автомобиль'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию об автомобиле. Поля, отмеченные звездочкой (*), обязательны для заполнения.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Класс автомобиля *</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => handleSelectChange('class', value)}
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Выберите класс" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleClasses.map((vehicleClass) => (
                        <SelectItem key={vehicleClass.value} value={vehicleClass.value}>
                          {vehicleClass.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Активность</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <label
                        htmlFor="isActive"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {formData.isActive ? 'Активен' : 'Неактивен'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Марка *</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Mercedes-Benz"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Модель *</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="E-Class"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Год выпуска *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    min={2000}
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Количество мест *</Label>
                  <Input
                    id="seats"
                    name="seats"
                    type="number"
                    value={formData.seats}
                    onChange={handleChange}
                    min={1}
                    max={30}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Краткое описание автомобиля"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Удобства (через запятую)</Label>
                <Textarea
                  id="amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="Wi-Fi, Кондиционер, Кожаный салон"
                  rows={2}
                />
                <p className="text-xs text-gray-500">
                  Перечислите удобства через запятую, например: "Wi-Fi, Кондиционер, Кожаный салон"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="flex justify-between">
                  <span>URL изображения</span>
                  {formData.imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowImagePreview(!showImagePreview)}
                    >
                      {showImagePreview ? 'Скрыть изображение' : 'Показать изображение'}
                    </Button>
                  )}
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500">
                  Укажите прямую ссылку на изображение. Рекомендуемое соотношение сторон 16:9
                </p>

                {showImagePreview && formData.imageUrl && (
                  <div className="mt-2 relative rounded-md overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={() => {
                        toast.error('Не удалось загрузить изображение')
                        setShowImagePreview(false)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpenDialog(false)}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    Сохранение...
                  </>
                ) : currentVehicle ? (
                  'Сохранить изменения'
                ) : (
                  'Добавить автомобиль'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
