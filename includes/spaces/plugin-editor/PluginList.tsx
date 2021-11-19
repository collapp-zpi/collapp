import { object, string } from 'yup'
import { useFilters, withFilters } from 'shared/hooks/useFilters'
import { useQuery } from 'shared/hooks/useQuery'
import { useState } from 'react'
import { PublishedPlugin } from '@prisma/client'
import { FiltersForm } from 'shared/components/form/FiltersForm'
import { InputText } from 'shared/components/input/InputText'
import { AiOutlineSearch } from 'react-icons/ai'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import Button from 'shared/components/button/Button'
import { PluginInfoModal } from 'includes/spaces/plugin-editor/PluginInfoModal'
import { PluginDeleteModal } from 'includes/spaces/plugin-editor/PluginDeleteModal'
import { PluginListItem } from 'includes/spaces/plugin-editor/PluginListItem'
import { LayoutType } from 'pages/spaces/[id]/settings/plugins'
import { MappedType } from 'includes/spaces/plugin-editor/PluginGrid'

const filtersSchema = object().shape({
  name: string().default(''),
})

const QUERY_WINDOW = 30

type InfoModalType = {
  open: boolean
  id: string | null
}

interface PluginListProps {
  mapped: MappedType
  setMapped: (fun: (data: MappedType) => MappedType) => void
  setLayout: (fun: (data: LayoutType[]) => LayoutType[]) => void
}

const PluginList = ({ mapped, setMapped, setLayout }: PluginListProps) => {
  const { data } = useQuery('plugins', '/api/plugins')
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [infoModal, setInfoModal] = useState<InfoModalType>({
    open: false,
    id: null,
  })
  const [filters, setFilters] = useFilters()

  const handleLoadMore = () => {
    setFilters({
      limit: String(Number(filters.limit) + QUERY_WINDOW),
    })
  }

  const handleAddPlugin = (plugin: PublishedPlugin) => () => {
    if (!!mapped?.[plugin.id]) return

    setMapped((mapped) => ({
      ...mapped,
      [plugin.id]: {
        name: plugin.name,
        icon: plugin.icon,
        isDeleted: plugin.isDeleted,
      },
    }))
    setLayout((layout) => [
      ...layout,
      {
        i: plugin.id,
        y: Infinity,
        x: 0,
        w: plugin.minWidth,
        h: plugin.minHeight,
        minW: plugin.minWidth,
        maxW: plugin.maxWidth,
        minH: plugin.minHeight,
        maxH: plugin.maxHeight,
        resizeHandles: [
          ...(plugin.minHeight !== plugin.maxHeight ? ['s'] : []),
          ...(plugin.minWidth !== plugin.maxWidth ? ['e'] : []),
          ...(plugin.minHeight !== plugin.maxHeight &&
          plugin.minWidth !== plugin.maxWidth
            ? ['se']
            : []),
        ],
      },
    ])
  }

  const handleDeletePlugin = (pluginId: keyof typeof mapped) => () => {
    setDeleteModal(null)
    const plugin = mapped?.[pluginId]
    if (!plugin) return

    setMapped((mapped) => ({
      ...mapped,
      [pluginId]: null,
    }))
    setLayout((layout) => layout.filter(({ i }) => i !== pluginId))
  }

  return (
    <>
      <div className="bg-white p-4 rounded-3xl shadow-2xl mt-4 sticky top-4">
        <FiltersForm schema={filtersSchema}>
          <InputText icon={AiOutlineSearch} name="name" label="Plugin name" />
        </FiltersForm>
        <div className="mt-2">
          {!data && (
            <div className="text-center p-4 flex items-center justify-center">
              <LogoSpinner size="w-8 h-7" />
            </div>
          )}
          {!!data && !data?.entities?.length && (
            <div className="text-center mt-4 text-gray-400">
              No plugins found
            </div>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto flex flex-col">
          {!!data &&
            !!data?.entities?.length &&
            data.entities.map((plugin: PublishedPlugin) => (
              <PluginListItem
                key={plugin.id}
                plugin={plugin}
                isAdded={!!mapped?.[plugin.id]}
                onInfo={() => setInfoModal({ open: true, id: plugin.id })}
                onAdd={handleAddPlugin(plugin)}
                onDelete={() => setDeleteModal(plugin.id)}
              />
            ))}
          {!!data?.pagination &&
            data.pagination.entityCount > data.pagination.limit && (
              <Button
                color="light"
                className="mx-auto mt-2"
                onClick={handleLoadMore}
              >
                Load more...
              </Button>
            )}
        </div>
      </div>
      <PluginInfoModal
        id={infoModal.id}
        open={infoModal.open}
        close={() => setInfoModal({ open: false, id: infoModal.id })}
        isAdded={!!infoModal?.id && !!mapped?.[infoModal.id]}
        handleAdd={handleAddPlugin}
        handleDelete={setDeleteModal}
      />
      <PluginDeleteModal
        open={deleteModal != null}
        close={() => setDeleteModal(null)}
        onClick={handleDeletePlugin(deleteModal as string)}
      />
    </>
  )
}

export default withFilters(PluginList, [], {
  name: '',
  limit: `${QUERY_WINDOW}`,
})
