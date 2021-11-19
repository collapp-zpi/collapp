import { PublishedPlugin } from '@prisma/client'
import { defaultPluginIcon } from 'shared/utils/defaultIcons'
import { Tooltip } from 'shared/components/Tooltip'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

interface PluginListItemProps {
  plugin: PublishedPlugin
  onInfo: () => void
  onAdd: () => void
  onDelete: () => void
  isAdded: boolean
}

export const PluginListItem = ({
  plugin,
  onInfo,
  onAdd,
  onDelete,
  isAdded,
}: PluginListItemProps) => (
  <div className="flex items-center">
    <div
      className="flex items-center p-2 rounded-xl hover:bg-gray-200 flex-grow transition-colors cursor-pointer"
      onClick={onInfo}
    >
      <img
        src={plugin.icon || defaultPluginIcon}
        className="w-10 h-10 rounded-25 mr-2"
        alt="Plugin icon"
      />
      <div className="flex flex-col w-100 flex-grow">
        <div className="w-full h-4 mb-1 relative">
          <div className="truncate font-bold whitespace-nowrap absolute w-full">
            {plugin.name}
          </div>
        </div>
        {!!plugin.description && (
          <div className="w-full h-4 relative">
            <div className="truncate text-xs text-gray-400 whitespace-nowrap absolute w-full">
              {plugin.description}
            </div>
          </div>
        )}
      </div>
    </div>
    {isAdded ? (
      <Tooltip value="Delete">
        <div
          className="p-2 ml-2 bg-red-50 text-red-400 cursor-pointer hover:bg-red-500 hover:text-white transition-colors rounded-xl"
          onClick={onDelete}
        >
          <FiTrash2 />
        </div>
      </Tooltip>
    ) : (
      !plugin.isDeleted && (
        <Tooltip value="Add">
          <div
            className="p-2 ml-2 bg-blue-50 text-blue-400 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors rounded-xl"
            onClick={onAdd}
          >
            <FiPlus />
          </div>
        </Tooltip>
      )
    )}
  </div>
)
