import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { id: 'asc' }
    })
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'Не удалось получить список автомобилей' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Валидация данных
    if (!body.class || !body.brand || !body.model || !body.year || !body.seats) {
      return NextResponse.json(
        { error: 'Не заполнены обязательные поля' },
        { status: 400 }
      )
    }

    // Создание нового автомобиля
    const newVehicle = await prisma.vehicle.create({
      data: {
        class: body.class,
        brand: body.brand,
        model: body.model,
        year: parseInt(body.year),
        seats: parseInt(body.seats),
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        amenities: body.amenities || null,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    // Перевалидация кэша для обновления UI
    revalidatePath('/admin')
    revalidatePath('/')

    return NextResponse.json(
      { message: 'Автомобиль успешно добавлен', vehicle: newVehicle },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json(
      { error: 'Не удалось создать автомобиль' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Валидация данных
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID автомобиля не указан' },
        { status: 400 }
      )
    }

    // Проверка существования автомобиля
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: body.id }
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Автомобиль не найден' },
        { status: 404 }
      )
    }

    // Обновление автомобиля
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: body.id },
      data: {
        class: body.class || existingVehicle.class,
        brand: body.brand || existingVehicle.brand,
        model: body.model || existingVehicle.model,
        year: body.year ? parseInt(body.year) : existingVehicle.year,
        seats: body.seats ? parseInt(body.seats) : existingVehicle.seats,
        description: body.description !== undefined ? body.description : existingVehicle.description,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existingVehicle.imageUrl,
        amenities: body.amenities !== undefined ? body.amenities : existingVehicle.amenities,
        isActive: body.isActive !== undefined ? body.isActive : existingVehicle.isActive
      }
    })

    // Перевалидация кэша для обновления UI
    revalidatePath('/admin')
    revalidatePath('/')

    return NextResponse.json(
      { message: 'Автомобиль успешно обновлен', vehicle: updatedVehicle },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить автомобиль' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID автомобиля не указан' },
        { status: 400 }
      )
    }

    // Проверка существования автомобиля
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Автомобиль не найден' },
        { status: 404 }
      )
    }

    // Удаление автомобиля
    await prisma.vehicle.delete({
      where: { id: parseInt(id) }
    })

    // Перевалидация кэша для обновления UI
    revalidatePath('/admin')
    revalidatePath('/')

    return NextResponse.json(
      { message: 'Автомобиль успешно удален' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить автомобиль' },
      { status: 500 }
    )
  }
}
