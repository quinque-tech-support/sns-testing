import { useState } from 'react'
import { updateAiUsageOption } from '../actions'

export function useSettings(initialAiOption: string) {
    const [selectedAiOption, setSelectedAiOption] = useState(initialAiOption || 'Normal AI Use')
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')

    const handleSaveAiOption = async () => {
        setIsSaving(true)
        setMessage('')
        const res = await updateAiUsageOption(selectedAiOption)
        setIsSaving(false)
        if (res.success) {
            setMessage('設定を保存しました。')
            setTimeout(() => setMessage(''), 3000)
        } else {
            setMessage('エラーが発生しました。')
        }
    }

    return {
        selectedAiOption,
        setSelectedAiOption,
        isSaving,
        message,
        handleSaveAiOption
    }
}
