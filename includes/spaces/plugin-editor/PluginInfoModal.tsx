import { PublishedPlugin } from '@prisma/client'
import { useQuery } from 'shared/hooks/useQuery'
import Modal from 'shared/components/Modal'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import Button from 'shared/components/button/Button'
import {
  InputRangeFrame,
  PureInputRange,
} from 'shared/components/input/InputRange'
import { defaultPluginIcon } from 'shared/utils/defaultIcons'

interface PluginInfoModalProps {
  id: string | null
  open: boolean
  close: () => void
  isAdded: boolean
  handleAdd: (plugin: PublishedPlugin) => () => void
  handleDelete: (id: string) => void
}

export const PluginInfoModal = ({
  id,
  open,
  close,
  isAdded,
  handleAdd,
  handleDelete,
}: PluginInfoModalProps) => {
  const { data } = useQuery(!!id && ['plugins', id], `/api/plugins/${id}`)

  if (!data)
    return (
      <Modal visible={open} close={close} className="max-w-screen-sm w-full">
        <div className="m-12">
          <LogoSpinner />
        </div>
      </Modal>
    )

  const {
    name,
    author,
    description,
    icon,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
  } = data

  return (
    <Modal visible={open} close={close} className="max-w-screen-sm w-full">
      <div className="flex flex-col p-4">
        <div className="flex items-center">
          <img
            src={icon || defaultPluginIcon}
            className="w-16 h-16 rounded-25 mr-4"
          />
          <div className="flex-grow flex flex-col">
            <div className="font-bold text-2xl">{name}</div>
            <div className="text-gray-400">{author?.name}</div>
          </div>
          {isAdded ? (
            <Button color="red-link" onClick={() => handleDelete(data.id)}>
              Delete
            </Button>
          ) : (
            <Button color="blue-link" onClick={handleAdd(data)}>
              Add
            </Button>
          )}
        </div>
        <p className="mt-4">{description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <InputRangeFrame
            className="mt-2"
            label="Width"
            display={
              minWidth === maxWidth ? minWidth : `${minWidth} - ${maxWidth}`
            }
          >
            <PureInputRange
              values={[minWidth, maxWidth]}
              min={1}
              max={4}
              disabled={true}
            />
          </InputRangeFrame>
          <InputRangeFrame
            className="mt-2"
            label="Height"
            display={
              minHeight === maxHeight
                ? minHeight
                : `${minHeight} - ${maxHeight}`
            }
          >
            <PureInputRange
              values={[minHeight, maxHeight]}
              min={1}
              max={4}
              disabled={true}
            />
          </InputRangeFrame>
        </div>
      </div>
    </Modal>
  )
}
