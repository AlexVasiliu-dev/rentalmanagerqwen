"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image, Plus, Trash2, Edit, Check, X, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PropertyImage {
  id: string
  propertyId: string
  url: string
  caption: string | null
  isPrimary: boolean
  order: number
}

interface PropertyImageGalleryProps {
  propertyId: string
  editable?: boolean
}

export function PropertyImageGallery({ propertyId, editable = false }: PropertyImageGalleryProps) {
  const t = useTranslations('properties')
  const tMessages = useTranslations('messages')
  const { data: session } = useSession()
  const [images, setImages] = useState<PropertyImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageCaption, setNewImageCaption] = useState("")

  const canEdit = editable && (session?.user.role === "ADMIN" || session?.user.role === "MANAGER")

  useEffect(() => {
    fetchImages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId])

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/property-images?propertyId=${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return

    setIsUploading(true)
    try {
      const response = await fetch("/api/property-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          url: newImageUrl,
          caption: newImageCaption || null,
        }),
      })

      if (response.ok) {
        await fetchImages()
        setNewImageUrl("")
        setNewImageCaption("")
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm(tMessages("confirmDelete"))) return

    try {
      const response = await fetch(`/api/property-images?id=${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchImages()
      }
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  const handleStartEdit = (image: PropertyImage) => {
    setEditingId(image.id)
    setEditCaption(image.caption || "")
  }

  const handleSaveEdit = async (imageId: string) => {
    try {
      const response = await fetch(`/api/property-images?id=${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editCaption }),
      })

      if (response.ok) {
        await fetchImages()
        setEditingId(null)
        setEditCaption("")
      }
    } catch (error) {
      console.error("Error updating image:", error)
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      const response = await fetch(`/api/property-images?id=${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      })

      if (response.ok) {
        await fetchImages()
      }
    } catch (error) {
      console.error("Error setting primary image:", error)
    }
  }

  const primaryImage = images.find(img => img.isPrimary) || images[0]
  const secondaryImages = images.filter(img => !img.isPrimary)

  if (isLoading) {
    return <div className="text-center py-8">{tMessages("loading")}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("images")}</h3>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={images.length >= 10}>
                <Plus className="h-4 w-4 mr-2" />
                {t("uploadImages")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("uploadImages")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Caption (optional)</label>
                  <Input
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    placeholder="Living room, Kitchen, etc."
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {tMessages("maxImages")}: {images.length}/10
                </div>
                <Button onClick={handleAddImage} disabled={isUploading || !newImageUrl.trim()}>
                  {isUploading ? tMessages("uploadingImage") : t("uploadImages")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{t("noProperties")}</p>
        </div>
      ) : (
        <>
          {/* Primary Image */}
          {primaryImage && (
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img
                    src={primaryImage.url}
                    alt={primaryImage.caption || "Property image"}
                    className="w-full h-full object-cover rounded-t-lg"
                    loading="lazy"
                  />
                  {primaryImage.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                      {primaryImage.caption}
                    </div>
                  )}
                  {canEdit && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      {!primaryImage.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(primaryImage.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStartEdit(primaryImage)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(primaryImage.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secondary Images Grid */}
          {secondaryImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {secondaryImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <CardContent className="p-0 relative">
                    <div className="aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.caption || "Property image"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-xs truncate">
                        {image.caption}
                      </div>
                    )}
                    {canEdit && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSetPrimary(image.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => editingId === image.id ? handleSaveEdit(image.id) : handleStartEdit(image)}
                        >
                          {editingId === image.id ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
