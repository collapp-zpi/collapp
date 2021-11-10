import Modal from 'shared/components/Modal'
import Button from 'shared/components/button/Button'

interface PluginDeleteModalProps {
  open: boolean
  close: () => void
  onClick: () => void
}

export const PluginDeleteModal = ({
  open,
  close,
  onClick,
}: PluginDeleteModalProps) => (
  <Modal visible={open} close={close}>
    <div className="p-4">
      <h1 className="text-2xl font-bold text-red-500">Caution!</h1>
      <p>
        This operation is irreversible. If you submit the changes, this will
        will permanently delete this plugin&apos;s data.
      </p>
      <div className="flex mt-6">
        <Button onClick={close} className="ml-auto" color="light">
          Cancel
        </Button>
        <Button onClick={onClick} className="ml-2" color="red">
          Delete
        </Button>
      </div>
    </div>
  </Modal>
)
