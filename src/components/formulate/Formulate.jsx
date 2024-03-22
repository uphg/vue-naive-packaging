import { defineComponent, h, ref, computed } from 'vue'
import { NForm, NGrid, NFormItem, NFormItemGi, NInput, NSelect, NInputNumber, NRadioGroup, NCheckboxGroup, NDatePicker, NRadio, NCheckbox } from 'naive-ui'
import { pick, omit, isNil } from 'lodash-es'

const formPropNames = ['disabled', 'inline', 'rules', 'size', 'labelWidth', 'labelAlign', 'labelPlacement', 'showFeedback', 'showLabel', 'validateMessages', 'showRequireMark', 'requireMarkPlacement']
// const formItemPropNames = ['feedback', 'first', 'ignorePathChange', 'label', 'labelAlign', 'labelPlacement', 'labelStyle', 'labelProps', 'labelWidth', 'path', 'rule', 'rulePath', 'showFeedback', 'showLabel', 'showRequireMark', 'requireMarkPlacement', 'size', 'validationStatus']
// const gridPropNames = ['layoutShiftDisabled', 'responsive', 'cols', 'itemResponsive', 'collapsed', 'collapsedRows', 'itemStyle', 'xGap', 'yGap']
const childPropNames = ['is', 'field', 'children', 'defaultValue']

const formulateMap = {
  input: NInput,
  select: NSelect,
  'input-number': NInputNumber,
  'radio-group': NRadioGroup,
  'checkbox-group': NCheckboxGroup,
  'date-picker': NDatePicker
}

const optionItemsMap = {
  'radio-group': NRadio,
  'checkbox-group': NCheckbox,
}

const formulateProps = {
  items: Array,
  grid: Object,

  theme: Object,
  themeOverrides: Object,
  builtinThemeOverrides: Object,
  inline: Boolean,
  labelWidth: [Number, String],
  labelAlign: String,
  labelPlacement: {
    type: String,
    default: 'top'
  },
  model: {
    type: Object,
    default: () => { }
  },
  rules: Object,
  disabled: Boolean,
  size: String,
  showRequireMark: {
    type: Boolean,
    default: undefined
  },
  requireMarkPlacement: String,
  showFeedback: {
    type: Boolean,
    default: true
  },
  onSubmit: {
    type: Function,
    default: (e) => {
      e.preventDefault()
    }
  },
  showLabel: {
    type: Boolean,
    default: undefined
  },
  validateMessages: Object
}

const Formulate = defineComponent({
  props: formulateProps,
  setup(props, context) {
    const formData = useFormData(props.items)
    const [formRef, formExpose] = useFormExpose()
    const formItems = computed(handleFormItems)

    context.expose({
      ...formExpose,
      get formData() {
        return formData.value
      }
    })

    function handleFormItems() {
      const result = []
      const stack = [[props.items, result]]
      let level = 0
      while (stack.length) {
        const part = stack.shift()
        const list = part[0]
        const newList = part[1]

        for (const item of list) {
          if (isNil(item)) continue
          const isOptionsNode = item.is === 'radio-group' || item.is === 'checkbox-group'
          const node = {
            is: item.is
              ? formulateMap?.[item.is]
              : (level === 0 && props.grid ? NFormItemGi : NFormItem),
            field: item.field,
            props: omit(item, isOptionsNode ? childPropNames.concat(['options']) : childPropNames)
          }

          if (isOptionsNode) {
            node.children = item.options.map(child => ({ is: optionItemsMap[item.is] ?? item.is, props: child }))
          } else if (item.children) {
            node.children = []
            stack.push([item.children, node.children])
          }
          newList.push(node)
        }
        level += 1
      }
      return result
    }

    function renderItem(node) {
      return node && h(node.is, { ...node.props, ...withUpdateValue(node) }, () => node.children?.map(renderItem))
    }

    function withUpdateValue(node) {
      return node.field ? {
        value: formData.value[node.field],
        onUpdateValue: (value) => formData.value[node.field] = value
      } : {}
    }

    function render() {
      const Items = formItems.value?.map(renderItem)
      return (
        <NForm ref={formRef} model={formData.value} {...pick(props, formPropNames)}>
          {props.grid ? (
            <NGrid {...props.grid}>
              {Items}
            </NGrid>
          ) : Items}
        </NForm>
      )
    }

    return render
  }
})

function useFormData(items) {
  const formData = ref({})
  const stack = [items]
  while (stack.length) {
    const list = stack.shift()
    for (const item of list) {
      if (item.is && item.field) {
        formData.value[item.field] = item.defaultValue ?? null
        item.children && stack.push(item.children)
      }
    }
  }
  return formData
}

function useFormExpose() {
  const formRef = ref(null)
  return [formRef, {
    validate(validateCallback, shouldRuleBeApplied) {
      return formRef.value.validate(validateCallback, shouldRuleBeApplied)
    },
    restoreValidation() {
      return formRef.value.restoreValidation()
    }
  }]
}

export default Formulate
