import Link from "next/link"
import { use } from "react"
import connectDB from "@/lib/db"
import PublishedDocument from "@/models/PublishedDocument"
import { ChevronLeft, Link as LinkIcon } from "lucide-react"

interface PublishedPageProps {
  params: Promise<{ id: string; publishId: string }>
}

export default function PublishedPage({ params }: PublishedPageProps) {
  const { id: projectId, publishId } = use(params)

  const documentPromise = (async () => {
    await connectDB()
    return PublishedDocument.findById(publishId).select("-__v").lean()
  })()

  const document = use(documentPromise)

  if (!document) {
    return (
      <div className="min-h-screen bg-[#F5F1E6] text-[#1F2937]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link href={`/projects/${projectId}`} className="text-sm text-[#6B7280] hover:text-[#1DA619] flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <div className="mt-6 bg-white border border-[#E5E0D4] rounded-lg p-6">
            <h1 className="text-xl font-semibold">Published document not found.</h1>
          </div>
        </div>
      </div>
    )
  }

  const shareUrl = `/projects/${projectId}/published/${publishId}`

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-[#1F2937]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* <div className="flex items-center justify-between mb-6">
          <Link href={`/projects/${projectId}`} className="text-sm text-[#6B7280] hover:text-[#1DA619] flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <div className="text-xs text-[#6B7280] flex items-center gap-2">
            <LinkIcon className="h-3 w-3" />
            {shareUrl}
          </div>
        </div> */}

        <div className="bg-white border border-[#E5E0D4] rounded-lg shadow-sm p-10">
          {/* {document.title && <h1 className="text-3xl font-serif font-bold mb-4">{document.title}</h1>} */}
          <div
            className="prose prose-lg max-w-none font-serif [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_li]:mb-2"
            dangerouslySetInnerHTML={{ __html: document.contentHtml }}
          />
        </div>
      </div>
    </div>
  )
}
