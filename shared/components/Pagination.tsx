import classNames from 'classnames'
import { GoChevronLeft, GoChevronRight } from 'react-icons/go'
import { IoEllipsisHorizontalSharp } from 'react-icons/io5'
import { createContext, useContext, useEffect } from 'react'
import { IconType } from 'react-icons'

type PaginationProps = {
  page: number
  pages: number
  setPage: (page: number) => void
}

const PaginationContext = createContext<Omit<PaginationProps, 'pages'>>({
  page: 1,
  setPage: () => undefined,
})

export const Pagination = ({ page, pages, setPage }: PaginationProps) => {
  useEffect(() => {
    if (pages > 0 && page > pages) setPage(pages)
    else if (page < 1) setPage(1)
  }, [page, pages, setPage])

  if (pages <= 1) return null

  return (
    <PaginationContext.Provider value={{ page, setPage }}>
      <div className="flex justify-center mt-2">
        {/* arrow prev */}
        {page > 1 && <Item page={page - 1} icon={GoChevronLeft} />}

        {/* first page */}
        <Item page={1} />

        {/* prev ellipsis */}
        {page > 1 + 2 && pages > 4 && (
          <Item page={Math.floor(page / 2)} icon={IoEllipsisHorizontalSharp} />
        )}

        {/* third prev, when at last page */}
        {page === pages && page - 2 > 1 && <Item page={page - 2} />}

        {/* current, prev and next page */}
        {page - 1 > 1 && <Item page={page - 1} />}
        {page > 1 && page < pages && <Item page={page} />}
        {page + 1 < pages && <Item page={page + 1} />}

        {/* third next, when at first page */}
        {page === 1 && page + 2 < pages && <Item page={page + 2} />}

        {/* next ellipsis */}
        {page < pages - 2 && pages > 4 && (
          <Item
            page={Math.ceil((page + 1 + pages) / 2)}
            icon={IoEllipsisHorizontalSharp}
          />
        )}

        {/* last page */}
        <Item page={pages} />

        {/* arrow next */}
        {page < pages && <Item page={page + 1} icon={GoChevronRight} />}
      </div>
    </PaginationContext.Provider>
  )
}

type IconProps = {
  page: number
  icon?: IconType
}

const Item = ({ page, icon: Icon }: IconProps) => {
  const pagination = useContext(PaginationContext)
  const active = pagination.page === page
  return (
    <div
      onClick={() => !active && pagination.setPage(page)}
      className={classNames(
        'font-bold w-10 h-10 rounded-25 flex items-center justify-center mx-1 transition-colors select-none',
        !Icon && {
          'shadow ': true,
          'bg-white hover:bg-gray-100 cursor-pointer': !active,
          'bg-blue-500 text-white cursor-default': active,
        },
        Icon && 'bg-opacity-0 bg-black hover:bg-opacity-5 cursor-pointer',
      )}
    >
      {Icon ? <Icon /> : page}
    </div>
  )
}
