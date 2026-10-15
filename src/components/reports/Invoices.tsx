import { View, Text } from 'react-native'

interface InvoicesReportProps {
  isAdmin: boolean
}

const InvoicesReport = ({ isAdmin }: InvoicesReportProps) => {
  return (
    <View>
      <Text>Reporte de ventas</Text>
    </View>
  )
}

export default InvoicesReport