import Filter from '../components/Filter'

export default function AdminSidebar({sidebarOptions}) {

  return <>
    {sidebarOptions.filter ? <Filter filterOptions={sidebarOptions.filterOptions} /> : null}
  </>
}