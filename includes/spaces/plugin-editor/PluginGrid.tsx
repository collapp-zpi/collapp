import {
  ComponentClass,
  createContext,
  Ref,
  useContext,
  useEffect,
  useState,
} from 'react'
import styled from 'styled-components'
import { defaultPluginIcon } from 'shared/utils/defaultIcons'
import classNames from 'classnames'
import { truncate } from 'shared/utils/text'
import GridLayout, { WidthProvider } from 'react-grid-layout'
import { LayoutType } from 'pages/spaces/[id]/settings/plugins'

export type MappedType = {
  [key: string]: {
    name: string
    icon: string | null
    isDeleted: boolean
  } | null
}

export const PluginRepoContext = createContext<MappedType>({})

const usePluginData = (id: string) => useContext(PluginRepoContext)[id]

interface PluginGridProps {
  layout: LayoutType[]
  setLayout: (data: LayoutType[]) => void
  width?: number
  innerRef?: Ref<HTMLDivElement>
}

interface InnerResponsiveGridProps extends PluginGridProps {
  width: number
  innerRef: Ref<HTMLDivElement>
}

export const PluginGrid = WidthProvider(function InnerResponsiveGrid({
  width,
  innerRef,
  layout,
  setLayout,
}: InnerResponsiveGridProps) {
  const [size, setSize] = useState(12)

  useEffect(() => {
    setSize(Math.ceil(width / 5.4 / 10) - 1)
  }, [width, setSize])

  return (
    <div ref={innerRef}>
      <div
        className="mx-auto"
        style={{ fontSize: 16 + (size - 16) * 0.5, width: size * 10 * 5.4 }}
      >
        <GridLayout
          layout={layout}
          cols={5}
          margin={[size, size]}
          rowHeight={size * 10}
          width={size * 5.4 * 10}
          onLayoutChange={(data) => setLayout(data)}
          resizeHandles={['s', 'se', 'e']}
        >
          {layout.map((data: LayoutType) => (
            <Tile key={data.i} className="bg-gray-200 relative">
              <Item id={data.i} />
            </Tile>
          ))}
        </GridLayout>
      </div>
    </div>
  )
}) as ComponentClass<PluginGridProps>

const Tile = styled.div`
  border-radius: 1.75em;
  font-size: 1em;

  &:hover .react-resizable-handle {
    opacity: 0.75;
  }
`

const TileImage = styled.img`
  width: 3em;
  height: 3em;
  border-radius: 0.6em;
`

const Item = ({ id }: { id: string }) => {
  const [isDragging, setDragging] = useState(false)
  const data = usePluginData(id)

  const handlePointerDown = () => {
    setDragging(true)
    document.addEventListener(
      'pointerup',
      () => {
        setDragging(false)
      },
      { once: true },
    )
  }

  return (
    <div
      className="absolute w-full h-full left-0 top-0 flex flex-col justify-center items-center p-4 overflow-hidden"
      onPointerDown={handlePointerDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <TileImage src={data?.icon || defaultPluginIcon} className="mb-2" />
      <span
        className={classNames(
          'text-center font-bold',
          data?.isDeleted && 'text-red-500',
        )}
      >
        {truncate(data?.name, 50)}
      </span>
    </div>
  )
}
