// import { promises as fsPromise, constants as fsConstants } from 'fs'

// export const promiseFsUnlink = async (newPath: string) => {
//   try {
//     // console.log(newPath)
//     // Kiểm tra quyền truy cập để xóa tệp tin
//     await fsPromise.access(newPath, fsConstants.W_OK)
//     // Nếu có quyền ghi, tiếp tục xóa tệp tin
//     await fsPromise.unlink(newPath)
//     console.log('File deleted successfully.')
//   } catch (err: any) {
//     if (err instanceof Error) {
//       console.error('Error deleting file:', err)
//     } else {
//       // Thêm quyền ghi nếu không có quyền ghi
//       try {
//         await fsPromise.chmod(newPath, 0o666) // Thêm quyền ghi (octal 666)
//         console.log('Write permission added successfully.')
//         // Tiếp tục xóa tệp tin sau khi thêm quyền ghi
//         await fsPromise.unlink(newPath)
//         console.log('File deleted successfully.')
//       } catch (error) {
//         console.error('Error deleting file:', error)
//       }
//     }
//   }
// }
import { promises as fsPromise, constants as fsConstants } from 'fs'

export const promiseFsUnlink = async (newPath: string) => {
  try {
    // Kiểm tra quyền truy cập để xóa tệp tin
    await fsPromise.access(newPath, fsConstants.W_OK)
    // Nếu có quyền ghi, tiếp tục xóa tệp tin
    await fsPromise.unlink(newPath)
    console.log('File deleted successfully.')
  } catch (err: any) {
    if (err.code === 'EACCES') {
      console.error('You do not have permission to delete the file:', newPath)
      // Thực hiện các hành động khác, như thông báo cho người dùng hoặc yêu cầu quyền hợp lệ
    } else if (err.code === 'EPERM') {
      console.error('Operation not permitted:', newPath)
      // Xóa tệp tin khi xuất hiện lỗi 'EPERM'
    } else if (err.code === 'ENOENT') {
      console.error('File not found:', newPath)
    } else {
      console.error('Error deleting file:', err)
    }
  }
}
