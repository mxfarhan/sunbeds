'use client'
import Layout from "../layout/Layout"
import Divider from "../storyBook/atoms/Divider"
import GalleryContent from "../storyBook/atoms/GalleryContent"
import { useEffect } from "react"
import { usePropertyDetails } from "@/hooks/queries/usePropertyDetails"
import { businessModeSelector } from "@/redux/reducers/settingsSlice"
import { useSelector } from "react-redux"
import { GalleryGroup } from "@/hooks/queries/usePropertyDetails"

const GalleryPage = () => {

  const businessMode = useSelector(businessModeSelector);

  const { data, isLoading: propertiesLoading, error: propertiesError, isError: propertiesIsError } = usePropertyDetails({
    slug: businessMode?.slug,
  }, true);

  const propertyData = data?.data

  const galleryImgs: GalleryGroup[] = propertyData?.images?.gallery ?? []

  useEffect(() => {
    if (propertiesIsError) {
      console.log("propertiesError =>", propertiesError)
    }
  }, [propertiesIsError]);

  return (
    <Layout>
      <section className="bg-white commonPY">
        <div className="container space-y-6 md:space-y-12">
          {galleryImgs.map((group, index) => (
            <div key={group.group}>
              <GalleryContent
                label={group.group}
                galleryImg={group.images}
                id={group.group}
              />
              {index < galleryImgs.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  )
}

export default GalleryPage
