declare module "react-simple-maps" {
  import { ReactNode, MouseEvent } from "react"

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    style?: React.CSSProperties
    children?: ReactNode
  }

  export interface GeographiesProps {
    geography: string | object
    children: (args: { geographies: GeoFeature[] }) => ReactNode
  }

  export interface GeoFeature {
    rsmKey: string
    id: string
    properties: {
      name: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }

  export interface GeographyProps {
    key?: string
    geography: GeoFeature
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: React.CSSProperties & { outline?: string; cursor?: string; fill?: string }
      hover?: React.CSSProperties & { outline?: string; fill?: string }
      pressed?: React.CSSProperties & { outline?: string }
    }
    onMouseEnter?: (evt: MouseEvent<SVGPathElement>) => void
    onMouseMove?: (evt: MouseEvent<SVGPathElement>) => void
    onMouseLeave?: (evt: MouseEvent<SVGPathElement>) => void
    onClick?: (evt: MouseEvent<SVGPathElement>) => void
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element
  export function Geographies(props: GeographiesProps): JSX.Element
  export function Geography(props: GeographyProps): JSX.Element
}
