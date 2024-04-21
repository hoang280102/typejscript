import fs from 'fs'

// Kiểm tra quyền truy cập để xóa tệp tin
export const fsUnlink = async (newPath: string) => {
  fs.access(newPath, fs.constants.W_OK, (err) => {
    if (err) {
      console.error('You do not have permission to delete the file.')
      // Nếu không có quyền ghi, cố gắng thay đổi quyền truy cập để cung cấp quyền ghi
      fs.chmod(newPath, 0o666, (err) => {
        if (err) {
          console.error('Error changing file permissions:', err)
        } else {
          console.log('File permissions changed successfully.')
          // Tiếp tục xóa tệp tin sau khi thay đổi quyền truy cập
          fs.unlink(newPath, (err) => {
            if (err) {
              console.error('Error deleting file 0:', err)
            } else {
              console.log('File deleted successfully.')
            }
          })
        }
      })
    } else {
      // Xóa tệp tin nếu có quyền ghi
      fs.unlink(newPath, (err) => {
        if (err) {
          console.error('Error deleting file 1:', err)
        } else {
          console.log('File deleted successfully.')
        }
      })
    }
  })
}
