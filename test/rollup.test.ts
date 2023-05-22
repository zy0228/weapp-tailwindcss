import { rollup } from 'rollup'
import type { OutputChunk, OutputAsset } from 'rollup'
import configs from '../rollup.config'
import { excludeKeys } from '../filter-obj'
function normalizeOutput(outputs: [OutputChunk, ...(OutputChunk | OutputAsset)[]]) {
  return outputs.map((x) => {
    return excludeKeys(x, ['modules', 'facadeModuleId', 'moduleIds'])
  })
}
// import type { RollupBuild } from 'rollup'
describe.skip('rollup build', () => {
  it('lib build', async () => {
    // const result:RollupBuild[] = []
    for (const config of configs) {
      const bundle = await rollup({
        input: config.input,
        external: config.external,
        output: config.output,
        plugins: config.plugins
      })
      if (Array.isArray(config.output)) {
        for (let j = 0; j < config.output.length; j++) {
          const { output } = await bundle.generate(config.output[j])
          expect(normalizeOutput(output)).toMatchSnapshot()
        }
      } else if (config.output) {
        const { output } = await bundle.generate(config.output)
        expect(normalizeOutput(output)).toMatchSnapshot()
      }
    }
  })
})
