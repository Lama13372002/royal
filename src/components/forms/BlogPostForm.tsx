'use client'

import React, { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

type BlogPost = {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  imageUrl: string | null
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

type BlogPostFormProps = {
  post?: BlogPost
  onSubmitSuccess: () => void
  onCancel: () => void
}

export default function BlogPostForm({ post, onSubmitSuccess, onCancel }: BlogPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    isPublished: post?.isPublished || false
  })
  const [imagePreview, setImagePreview] = useState<string | null>(post?.imageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isPublished: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, загрузите изображение')
      return
    }

    // Создаем предварительный просмотр
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Валидация
    if (!formData.title.trim()) {
      toast.error('Пожалуйста, укажите заголовок статьи')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Пожалуйста, добавьте содержание статьи')
      return
    }

    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()

      // Добавляем ID при обновлении существующего поста
      if (post?.id) {
        formDataObj.append('id', post.id.toString())
      }

      // Добавляем текстовые поля
      formDataObj.append('title', formData.title)
      formDataObj.append('content', formData.content)
      formDataObj.append('excerpt', formData.excerpt)
      formDataObj.append('isPublished', formData.isPublished.toString())

      // Добавляем файл изображения, если он выбран
      if (fileInputRef.current?.files?.[0]) {
        formDataObj.append('image', fileInputRef.current.files[0])
      }

      // Отправляем запрос на сервер
      const response = await fetch('/api/blog', {
        method: post ? 'PUT' : 'POST',
        body: formDataObj
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Произошла ошибка при сохранении')
      }

      toast.success(post ? 'Статья успешно обновлена' : 'Статья успешно создана')
      onSubmitSuccess()

    } catch (error) {
      console.error('Error submitting blog post:', error)
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка при сохранении')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{post ? 'Редактирование статьи' : 'Создание новой статьи'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 overflow-visible">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Заголовок статьи *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Введите заголовок статьи"
              className="w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Краткое описание (отображается в списке статей) *
            </label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Краткое описание статьи"
              className="w-full"
              rows={2}
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Содержание статьи *
            </label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Содержание статьи"
              className="w-full"
              rows={10}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Вы можете использовать HTML-теги для форматирования текста (например, &lt;strong&gt;, &lt;br&gt;, &lt;p&gt;).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Изображение для статьи
            </label>
            <Input
              id="image"
              name="image"
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              Рекомендуемый размер: 1200x630px
            </p>

            {imagePreview && (
              <div className="mt-2">
                <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${imagePreview})` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={handleCheckboxChange}
            />
            <label
              htmlFor="isPublished"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Опубликовать статью
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : post ? 'Обновить' : 'Создать'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
