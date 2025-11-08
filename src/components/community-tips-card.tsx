"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MapPin, User, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface CommunityTip {
  id: string
  title: string
  content: string
  cropName: string
  location: string
  upvotes: number
  userId: string
  hasUpvoted: boolean
  user: {
    name: string
    farmName?: string
  }
  createdAt: string
}

interface CommunityTipsCardProps {
  tips: CommunityTip[]
  onUpvote: (tipId: string) => void
  onDelete: (tipId: string) => void
  currentUserId?: string
}

export function CommunityTipsCard({ tips, onUpvote, onDelete, currentUserId }: CommunityTipsCardProps) {
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set())

  const toggleExpand = (tipId: string) => {
    const newExpanded = new Set(expandedTips)
    if (newExpanded.has(tipId)) {
      newExpanded.delete(tipId)
    } else {
      newExpanded.add(tipId)
    }
    setExpandedTips(newExpanded)
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Tips Komunitas Petani</h3>

      {tips.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Belum ada tips. Bagikan pengalaman Anda!</p>
      ) : (
        <div className="space-y-4">
          {tips.map((tip) => {
            const isExpanded = expandedTips.has(tip.id)
            return (
              <div key={tip.id} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold">{tip.title}</h4>
                    <Badge className="mt-2" variant="outline">
                      {tip.cropName}
                    </Badge>
                  </div>
                  {currentUserId === tip.userId && (
                    <Button
                      onClick={() => onDelete(tip.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="mb-3">
                  <p className={`text-sm text-muted-foreground ${!isExpanded ? "line-clamp-2" : ""}`}>{tip.content}</p>
                  {tip.content.split("\n").length > 1 || tip.content.length > 150 ? (
                    <Button
                      onClick={() => toggleExpand(tip.id)}
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs h-auto p-0 text-primary hover:bg-transparent"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Tutup
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Baca Selengkapnya
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{tip.user.farmName || tip.user.name}</span>
                  </div>
                  {tip.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{tip.location}</span>
                    </div>
                  )}
                  <span>{new Date(tip.createdAt).toLocaleDateString("id-ID")}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => onUpvote(tip.id)}
                    variant={tip.hasUpvoted ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    disabled={tip.hasUpvoted}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{tip.upvotes}</span>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
